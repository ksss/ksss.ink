---
title: springコンテナ無しでspringを使いたい
date: '2021-04-13'
---

# まあそんなもんかな

rspecなどを叩くたびに、毎回5sほど待っていたのですが、まあそんなもんかなと思っていました。

しかし、「本当にそうなのか？」という疑問が湧き上がりました。

ちゃんと調べてみると、これまでまったく気がついていませんでしたが開発中のRailsプロジェクトで[spring](https://github.com/rails/spring)がうまく動いてませんでした。。。これはショック。

# Spring is not running.

よくよくspringのことを調べてみると、自分の環境ではspringが動いていないことがわかりました。

```
$ docker-compose exec api bin/spring status
Spring is not running.
```

こりゃ本腰入れるかと、とりあえず本家のdocumentを読みます。

[https://github.com/rails/spring](https://github.com/rails/spring)

ふむふむ。特に何も考えなくても使えるツール的な雰囲気がします。

dockerに入っていろいろ試してみましょう。

```
$ docker-compose exec api bash
root@207515053d29:/api# bin/spring stop
Spring stopped.
root@207515053d29:/api# time bin/rake -T > /dev/null
Running via Spring preloader in process 253

real	0m9.134s
user	0m0.105s
sys		0m0.039s
root@207515053d29:/api# time bin/rake -T > /dev/null
Running via Spring preloader in process 264

real	0m1.034s
user	0m0.101s
sys		0m0.029s
root@207515053d29:/api# time bin/rake -T > /dev/null
Running via Spring preloader in process 273

real	0m1.085s
user	0m0.112s
sys		0m0.033s
root@207515053d29:/api# bin/spring status
Spring is running:

  240 spring server | api | started 53 secs ago
  242 ruby -I /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib -e require 'spring/application/boot'
````

なるほど。確かに初回は9s、2回目以降は1sと高速化しています。

やれやれと思ってdockerから抜けると……。

```
$ docker-compose exec api bin/spring status
Spring is not running.

$ time docker-compose exec api bin/rake -T > /dev/null
docker-compose exec api bin/rake -T > /dev/null  0.41s user 0.10s system 5% cpu 9.414 total
```

えええ……。

ちょっと深くまでは追っていませんが、dockerから抜けるとspringは止まってしまうようです。shellの子プロセスとして動いているのかな？

普段は`docker-compose exec`でrails consoleやらrspecやらを動かしたい派なので、これは結構困ります。

ざざーっとspringのコードを読んだ上での想像ですが、おそらく現在のプロセスからforkしてアプリケーションコードを読み込み、spring processを立ち上げ、unix domain socketを作ってそこにコマンドを送り込んで実行する的な感じなのでしょう。たぶん。

なので、求めるソリューションとしては、常時spring serverが立っている必要があります。

# クラフト隊長みたいに

なんとかdocker上でいい感じにspringを使うことができないものかとサッとググってみると、[https://github.com/jonleighton/spring-docker-example](https://github.com/jonleighton/spring-docker-example)を参考にした記事が多いようでした。

基本的にspring containerを立ち上げて、unix domain socket用のvolumeを作り、アプリケーションから参照できるようにして入力コマンドに気をつけて……。

<strong class="text-2xl">やってられるかああああああああ</strong>

springに期待するのは影でコソコソやってほしいのであって、表立ってバリバリ考えることを増やしてもらうことではありません。複数のプロセスからspringを活用したいのであれば、専用containerを立てるのもいいかもしれませんが、そんなシーンは正直想像できません。

もっと簡単なソリューションは無いものでしょうか。

# かごめかごめ

求めているものはdockerに入って`$ bin/rake`としたときに自動的に立ち上がってくれるアレです。

spring serverでもいいのですが、バックグラウンドで動いてくれるアレが欲しいのです。

あの子がほしい。

あの子じゃわからんので一生懸命springのコードを読んだ結果、undocumentedですが以下の方法を見つけました。

```
$ bin/spring server --background &
```

`--background`というundocumentedなオプションを付けると、ログが消えてくれます。
さらに`&`でバックグラウンドプロセスに無理矢理することができます。

これをentrypointスクリプトで実行させれば、影でこっそり動いてくれるはずです。

```
$ time docker-compose exec api bin/rake -T > /dev/null
docker-compose exec api bin/rake -T > /dev/null  0.40s user 0.09s system 30% cpu 1.635 total
```

これで無駄な時間が一日5s × 100回 = 500sくらいは減るでしょう。トータルで2時間くらいかかったので15日経てばペイします。やったね。

# 追記

docker-compose upしてCTRL+Cで終了する運用をしていたのですが、2回に1回必ず以下のエラーが出てspring serverも立ち上がりません。

```
/api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/server.rb:47:in `initialize': Address already in use - connect(2) for /tmp/spring-0/93af75a8297fc11a0f686ab9ea1fa5e3 (Errno::EADDRINUSE)
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/server.rb:47:in `open'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/server.rb:47:in `start_server'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/server.rb:43:in `boot'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/server.rb:14:in `boot'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/client/server.rb:10:in `call'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/client/command.rb:7:in `call'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/client.rb:30:in `run'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/bin/spring:49:in `<top (required)>'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/binstub.rb:5:in `load'
	from /api/vendor/bundle/ruby/3.0.0/gems/spring-2.1.1/lib/spring/binstub.rb:5:in `<top (required)>'
	from <internal:/usr/local/lib/ruby/3.0.0/rubygems/core_ext/kernel_require.rb>:85:in `require'
	from <internal:/usr/local/lib/ruby/3.0.0/rubygems/core_ext/kernel_require.rb>:85:in `require'
	from bin/spring:15:in `<main>'
```

おそらくバックグラウンドプロセスグループで起動しているため、docker-compose終了時にシグナルが届かず、unix domain socket fileとpid fileが残ってしまうようです。
うまいことシグナルを届けることができればいいのですが、よく分からなかったので、`bin/spring server --background &`の直前にファイルを削除することにしました。

```
$ rm -f /tmp/spring-0/*
$ bin/spring server --background &
```

これで毎回springの起動に成功します。やったね。
