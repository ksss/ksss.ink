---
title: ridgepoleの起動をめっちゃ早くする
date: '2021-04-16'
---

# 要約

新gem [spring-commands-ridgepole](https://rubygems.org/gems/spring-commands-ridgepole)を作ったので使ってみてね。

Gemfileに

```rb
gem 'spring-commands-ridgepole', group: :development
```

をコピペするだけでinstallできるよ。

```
$ bin/spring binstub ridgepole
```

でbinstubを作って、

```
$ bin/ridgepole
```

で使えるよ。

# ridgepole

[ridgepole](https://github.com/winebarrel/ridgepole)という神ツールを皆様御存知でしょうか。

Rails migration的なAPIでテーブル定義を宣言しておくと、その通りにデータベースにテーブルを構築してくれるツールです。

RDB界のReactです。

プロジェクト超初期ではテーブル定義は試行錯誤を繰り返すのでめちゃくちゃ変更します。
宣言的にテーブルが書けて考えも整理しやすく、私はridgepoleを愛用しています。

しかし、悩みがありました。私の環境では**起動が遅い**ということです。

実際に実行してみましょう。

```shell
$ time docker-compose exec api bundle exec ridgepole --env development --config config/database.yml --apply
Apply `Schemafile`
No change
docker-compose exec api bundle exec ridgepole --env development --config    0.40s user 0.10s system 1% cpu 37.273 total
```

37s

テーブル構成をあれこれ試しまくりたい。高速に開発しないとやりたいこと忘れちゃう。気がついたらtwitter見ちゃう。
そんな自分としては、これは悩みのタネでした。

# spring

そこでピーン。前回のblog postを思い出しました。

[https://ksss.ink/blog/posts/7-spring](https://ksss.ink/blog/posts/7-spring)

もしridgepole起動の遅い原因がRailsコードの読み込みなのだとしたら、springで高速化するはずです。
特に計測もしていませんがやってみましょう。

# spring-commands-*

springを使ったコマンドを作るのはハッキリ言って結構めんどくさいです。

なんか全コマンドいい感じになればいいのにな。

ともかくspringでコマンドを作るには**gemを作る必要があります**。

[https://github.com/rails/spring/blob/577cf01f232bb6dbd0ade7df2df2ac209697e741/lib/spring/commands.rb#L36-L46](https://github.com/rails/spring/blob/577cf01f232bb6dbd0ade7df2df2ac209697e741/lib/spring/commands.rb#L36-L46)

```rb
  # Auto-require any Spring extensions which are in the Gemfile
  Gem::Specification.map(&:name).grep(/^spring-/).each do |command|
    begin
      require command
    rescue LoadError => error
      if error.message.include?(command)
        require command.gsub("-", "/")
      else
        raise
      end
    end
  end
```

このようにgemspecを読み込んでrequireするようになっているので、Gemfileで`path`指定するか、publicなgemとして作るしかありません。

とはいえ実装は短いです。

皆さんのアプリケーションのGemfileにも[spring-commands-rspec](https://github.com/jonleighton/spring-commands-rspec)等が忍ばれていませんか？

rspec用でも実装は実質[これだけ](https://github.com/jonleighton/spring-commands-rspec/blob/master/lib/spring/commands/rspec.rb)です。

```rb
module Spring
  module Commands
    class RSpec
      def env(*)
        "test"
      end

      def exec_name
        "rspec"
      end

      def gem_name
        "rspec-core"
      end

      def call
        ::RSpec.configuration.start_time = Time.now if defined?(::RSpec.configuration.start_time)
        load Gem.bin_path(gem_name, exec_name)
      end
    end

    Spring.register_command "rspec", RSpec.new
    Spring::Commands::Rake.environment_matchers[/^spec($|:)/] = "test"
  end
end
```

こうしてgemをinstallしておくだけで、springでbinstubを生成したり、springを土台にコマンドを実行できて高速化を図ることができます。

# でもちょっと大変だった

ちょっとハマった点としては、

ridgepoleが、おそらく

```
ridgepole読み込み => Railsコード読み込み
```

という順番を想定しています。

しかしspringでは

```
springでRailsコード読み込まれてる => ridgepole読み込み
```

の順番になってしまうので[without_table_options](https://github.com/winebarrel/ridgepole/blob/1847a679dfbcd10ca6572a56afab22a8724dc897/lib/ridgepole/ext/abstract_adapter/disable_table_options.rb)がなくてNoMethodErrorになってしまいました。

この辺を理解するのがハマりました。理解できたら解消はすぐでした。

# 37s => 1s

ともかくがんばって作った成果はというと

```shell
$ time docker-compose exec api bin/ridgepole --env development --config config/database.yml --apply
Running via Spring preloader in process 1023
Apply `Schemafile`
No change
docker-compose exec api bin/ridgepole --env development --config  --apply  0.39s user 0.09s system 37% cpu 1.273 total
```

37s => 1sと超高速化することができています！！！

私はdevelopmentとtest環境で同時に適用されるように

```rb
task :apply do |t|
  ["development", "test"].each do |env|
    system "bin/ridgepole --env #{env} --config config/database.yml --apply"
  end
end
```

とRake taskを組んでいるので、およそ1分かかっていたものが2秒位で終わります。記述も簡潔です。導入もgemをinstallするだけです。

これは革命。

1回あたり約1分短縮しているので、このgemを作るのにかかった2時間くらいを考えると、120回叩いたらペイします。

やったね。
