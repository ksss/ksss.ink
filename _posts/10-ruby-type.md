---
title: そろそろRailsプロジェクトに型を導入したい人向けの資料
date: '2021-08-26'
---

すべての説明はイチRubyユーザーの個人的で期間も限定的な観測範囲に基づきます。

# 「Rubyには型がない」

ある日、同僚とプログラミング言語に関する雑談をしていたときに言われた一言です。

私はその日までRubyの型機能は使っていませんでした。忙しい毎日を送り、キャッチアップを疎かにしていたのです。後日このことは猛烈に反省することになります。

**「Rubyには……型があるッ……！」**

火がついた私はパターンマッチの時と同様にRubyの型についてキャッチアップすることにしました。そして最高の体験が待っていました。

# 導入した後の世界

ぶっちゃけRubyの型を導入するとどうなるのでしょうか？

メチャクチャ簡単に説明すると、エディタでバグがひと目で分かるようになります。

![post.rb](/10-ruby-type/post.png)

vscodeでの画面です。なにやら赤線がついています。

### === bar ===

`bar`の部分にカーソルを合わせてみましょう。

![bar](/10-ruby-type/bar.png)

「Postクラスにはbarという名前のmethodはないよ」というメッセージが表示されています。
この表示は特にtypoチェックに役立ちます。

### === blog.user.stats ===

今度は`blog.user.stats`の赤線部分に合わせてみましょう

![blog.user.stats](/10-ruby-type/stats.png)

「Userクラスにはstatsという名前のmethodはないよ」というメッセージが表示されています。
`blog`や`user`は何のオブジェクトを返すのか解釈した上で、`stats`というmethodがないことも見つけることができています。
これもtypoチェックに役立ちそうです。

### === point * 100 ===

今度は`point * 100`の部分です。一見`point`は`1`か`2`が入っていて大丈夫そうに見えます。
何がいけなかったのでしょうか？

![point * 100](/10-ruby-type/point.png)

「Integerもしくはnilなので`*`は呼べないよ」と出ています。
そう、`case`文はどこにも条件が引っかからなかった場合`nil`を返します。
その可能性まで考慮しているのです。
これにより、`nil`の考慮漏れをふせぐことができます。

しかし、さらにその下の`point * 100`の部分は赤線がありません。これは

```rb
return unless point
```

というコードによって、`point`が`nil`である可能性が排除されるので、問題なく`*`が呼べているのです。

ここで紹介したものはごく一部でしかありません。

## 他にも

- methodの返り値を決め、実装がその通りになっているかチェック
- `has_one`関連など`nil`が返る可能性があるmethodがひと目で分かる
- methodのキーワード引数のオートコンプリート

等々、さまざまな機能を享受することができます。

これはもはや**Ruby界の革命**です。

導入しない手はないでしょう。

# 導入方法

## Rubyのversion

「型はRuby3の機能でしょ」と思われがちですが、
2.6以上であれば導入可能です。

## [Steep](https://github.com/soutaro/steep)導入

### dockerの場合

dockerプロジェクトの場合はlocalに入れたほうが楽です。

1. Steepをインストール

通常の場合

```shell
gem install steep
```

最新版を使いたい場合

```shell
$ gem specific_install -l https://github.com/soutaro/steep.git
```

2. `bin/steep`を作る

```rb
#!/usr/bin/env ruby
load Gem.bin_path('steep', 'steep')
```

```shell
$ chmod +x bin/steep
```

### dockerじゃない場合

```rb
gem 'steep', require: false
```

これでsteepコマンドの準備ができました。

## [vscode-steep](https://marketplace.visualstudio.com/items?itemName=soutaro.steep-vscode)の導入

vscodeの拡張で`steep`と検索すれば見つけることができます。
これをinstallしましょう。

## [gem_rbs_collection](https://github.com/ruby/gem_rbs_collection)の設置

READMEに従って、submoduleとしてリポジトリに追加します。
この辺は将来的に別の方法でも実現できるようになっているかも。
現状はsubmoduleが取り回しやすいです。

```
git submodule add https://github.com/ruby/gem_rbs_collection.git vendor/rbs/gem_rbs_collection
```

## Steepfileの設置

リポジトリのトップに以下の内容で`Steepfile`として保存します。

steepはこのファイルを読み込んで型チェックの対象範囲と型定義範囲を決めます。

型定義には別の型定義への依存関係があるものもあります。

ここにある`library`の記述は、全てRailsのための依存ライブラリです。

将来的に短くなるかもしれませんが、現状型定義に依存する型定義を全て記述しなければならないようです。

```rb
target :app do
  check "app/models"
  signature "sig"
  repo_path "vendor/rbs/gem_rbs_collection/gems"

  library 'pathname'
  library 'logger'
  library 'mutex_m'
  library 'date'
  library 'monitor'
  library 'singleton'
  library 'tsort'
  library 'securerandom'
  library 'base64'
  library 'forwardable'
  library 'time'
  library 'json'

  library 'rack'

  library 'activesupport'
  library 'actionpack'
  library 'activejob'
  library 'activemodel'
  library 'actionview'
  library 'activerecord'
  library 'railties'
end
```

`app/models`ディレクトリをチェック対象として、`sig`ディレクトリに型定義を保存する設定になっています。

これでsteepは最低限動かせますが、動かしてもエディタは真っ赤になっているでしょう。
Railsは動的にメソッドを追加する事が多いので、activerecord等のライブラリ型定義だけでは足りません。この動的定義を補完するにはrbs_railsを使います。

## [rbs_rails](https://github.com/pocke/rbs_rails)の導入

READMEに従い、`Gemfile`に以下を追加。

```rb
gem 'rbs_rails', require: false
```

`lib/tasks/rbs.rake`ファイルを以下の内容で作ります。

```rb
require 'rbs_rails/rake_task'
RbsRails::RakeTask.new
```

次に`$ bin/rake rbs_rails:all`を実行します。

これにより、アプリケーションのモデルファイルを読み取って、型定義(rbsファイル)が生成されます。

Railsは様々なmethodを自動生成します。

ここで生成された型定義はこの自動生成されるmethodを補完するものです。

ここで生成されたファイルは基本的に編集しません。編集しても`$ bin/rake rbs_rails:all`を再実行すると上書きされてしまいます。

ここまで実行できれば、だいぶエラーが減るでしょう。

## sig/app/models/*を補完

rbs_railsはあくまでRailsが自動生成するmethodを補完するものであるため、アプリケーションコードのmodelに定義されたconstやmethodの定義は生成されません。

これらはrbs_railsでは関与せず、アプリケーションで管理する前提なのかなと予想されます。
イチからrbsファイルを作ってもいいのですが、面倒なので、以下のスクリプトでざっくりプロトタイプを作っておいて、あとで編集すると便利です。

```bash
for file in app/models/**/*.rb
do
  mkdir -p sig/$(dirname $file)
  rbs prototype rb $file > sig/${file}s
done
```

このスクリプトで`sig/app/models`以下にmodel毎にファイル分けされたプロトタイプが生成されます。

ちなみにrbsファイルは分けても分けなくてもどちらでもよく、全部読み込んでから全部判定という手順をとっているようです。

`rbs prototype rb`ではファイルの内容を静的に見ているだけなので、引数や返り値はほとんど`untyped`でしょう。

このファイル達はアプリケーションで管理する型定義です。ガンガン編集していきましょう。

お疲れさまでした。あなたのRailsプロジェクトに型が導入されました。

## 動作確認

ここまできたらエディタで`app/models`のコードを見てみましょう。

**あなたは新しい世界に飛び込むことでしょう。**

「あーここはDBのカラムがnullを許可しているのにコードでは考慮できてなかったなー。」

「`has_one`だから関連レコードがない場合は`nil`になっちゃうのか。この場合の考慮が漏れてた。」

「変数名typoしてた。」

のような気付きが、**ひと目で**分かるようになるでしょう。

まだいくつかエラーが出ているかもしれません。
その原因は様々です。ライブラリーの問題かもしれません。まだプロトタイプの型定義の問題かもしれません。アプリケーションの問題かもしれません。

全部治す必要はないですが、「これは無視できる」「これは無視できない」を見分ける必要があります。

もしライブラリーの問題ならissueで報告するかPRを作ると良いと思います。
あなたの行った問題解決が、全世界に還元されます。

もしアプリケーションの型定義の問題なら、型定義を修正しましょう。コツは「こうあるべき」を書くことです。

もしアプリケーションの問題なら……。おめでとうございます。あなたは静的型検査によってアプリケーションのバグを発見することができしました。

# 導入してみた感想

## バグの発見

私はRubyの型検査でアプリケーション内でのバグをいくつか発見することができました。
単純な変数名のtypo、未定義のmethodの発見、オブジェクトがnilになる可能性など。

確かに自動テストを書いていればこれらの問題を発見できていたかもしれません。
しかしながら、「テストを書かなくても、コードを実行しなくても問題を発見できる」というのは利点になると思います。

例えば分岐パターンが多すぎてテストケースを全パターン用意するのが困難なケースでも、実行自体が難しいAPI連携や重い処理でも、
最低限の静的チェックを行うことができます。

まだ導入から日が浅く、その効果を実感できていませんが、リファクタリングのしやすさや、コード理解にも役立つことが見込めます。

## 型定義の方針

ライブラリーで自動生成されるメソッドはできるだけ型定義を自動生成し、アプリケーション固有の定義はアプリケーションで型定義を手書きしていくのが良いと思われます。

ライブラリーの定義がまるごとない場合は、アプリケーション内で試しに以下のコードでライブラリーの型定義のプロトタイプを作ってみて、gem_rbs_collectionなどにPRを送るのが良いのではないでしょうか。

```shell
rbs prototype rb lib/**/*.rb > lib.rbs
```

## 型ファースト

例えば、あなたはモデルに1つmethodを追加したくなりました。
大体の仕様は頭にあるはずです。

あなたは最初に何を書きますか？

実装？

テスト？

私は、もしかしたら型定義を最初に書く手法が今後使われるような気がしました。

型駆動開発**≪TDD(Type Driven Development)≫**の誕生です。

## 埋めきれないエラー

いくつかは既存の型定義や自動生成などによって保管されましたが、
いまだ多くのライブラリーで型定義が足りていない状況かと思われます。

実用的なアプリケーションで、エラーが一つもない状況を保つのはしばらく困難でしょう。
地道にライブラリーの型定義を増やしていく活動が必要かと思われます。

やっていきましょう。

# ツールの説明

以下はオマケとして、私の現時点での各ツールの私の理解です。

型(rbs)を「使う人」と「書く人」によって使うツールが異なることを考慮すると、理解しやすいかもしれません。

## [rbs](https://github.com/ruby/rbs)

型定義専用の言語です。Rubyとは構文が似ているようで異なります。
また、cliツール名でもあります。
「使う人」と「書く人」両方にとって重要なので、構文は覚えたほうがいいでしょう。
`$ rbs prototype rb`コマンドも便利なのでよく使います。

## [steep](https://github.com/soutaro/steep)

rbsに基づいて、実際のRuby構文に対して型チェックをかけるツールです。
rbsは元々steep用の構文だったとか。[出典](https://techlife.cookpad.com/entry/2020/12/09/120454)

「使う人」と「書く人」両方にとって重要なツールですが、直接cliから使うことは少ないかもしれません。ほとんどはエディタを介して使うことになるからです。

## [steep-vscode](https://github.com/soutaro/steep-vscode)

地味に重要なツールです。
Steepはlanguage server protocol(LSP)を扱う事ができます。
steep-vscodeは、vscodeとsteepをLSPを通じて連携させるvscode extensionです。

「使う人」が最も多用するのは、エディタで個々のファイルを閲覧・編集しながら型のサポートを受ける使い方でしょう。
この機能を使って、今エディタで見ているファイルに対して高速な型検査を実現しています。

vscode-steepは`bin/steep`があればこっちを優先して、なければ`bundle exec steep`を実行するようです。
この仕様を利用して、dockerの場合は`bin/steep`を作っています。

## [gem_rbs_collection](https://github.com/ruby/gem_rbs_collection)

TypeScriptで言う[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)みたいなやつです。
ライブラリーが型定義を持つこともできますが、過去のversionには当然組み込めないことや、型関係のツールはまだ実験的な部分があるのでいきなり大きなライブラリーに組み込んでも後で変更しにくくなると困るから別付けにしてまとめているんだと思います。
しかしながらversion毎の管理が大変そうなので、将来的には型定義はライブラリーに組み込まれた方がいい気がします。でもメンテナーにとっては管理するものが増えて大変……？最適な運用はみんなで考えていきましょう。

ちなみにライブラリーに型(rbs)を組み込む場合は、現状`sig`というディレクトリーを切ってその下にrbsを書けば、後から読み出せるようになっています。

## [rbs_rails](https://github.com/pocke/rbs_rails)

gem_rbs_collectionでActiveRecordのライブラリー的な型は分かるのですが、Railsアプリケーションでは自動生成されたmethodがあるのが普通です。

個々のRailsアプリケーションを読み取って、それぞれのプロジェクト用のrbsを自動生成するツールがこちら。

自動生成されるので「使う人」向けですね。

型定義と自動生成は、個人的に相性がいい気がしています。

今あるアプリケーションコードを全く修正することなく導入できるので。

## [TypeProf](https://github.com/ruby/typeprof)

コードを静的解析して、実際の使われ方からrbsを自動生成するツール。
「こういう場合はどういう型を書けばいいんだろう？」と迷ったら、小さなサンプルコードを書いてTypeProfを実行してみると良いかもしれません。

型素人の予想で恐縮ですが、おそらく将来的には型ファイルを人間が書かなくても、全部typeprofが推測してくれることを目指しているんじゃないかなと予想しています。
将来的にはLSP対応とかするのかも。

SteepはRubyでmethodを追加しても、定義がないと呼び出している箇所で型エラーになってしまい、型を書かざるをえません。ここでいい感じに推測してくれたらいいのになーと思うので、TypeProfはこっち側(型を書かない方向)を目指していそうです。

しかしながらSteepでもif文やcase文等で、ある程度型を推測してくれているっぽいので、どう差別化するのか、あるいは統合するのか、今後の発展が楽しみです。

現時点では「書く人」用、将来的には「使う人」向けになるのかも。

[https://mametter.hatenablog.com/entry/2020/12/14/214326](https://mametter.hatenablog.com/entry/2020/12/14/214326)

# まとめ

型最高！
