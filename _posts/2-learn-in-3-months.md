---
title: ここ3ヶ月で学んだことまとめ
date: '2021-03-20'
---

# Rubyのパターンマッチ

2020年は、ほとんどプログラミング的なキャッチアップをしてこなかったので、
Ruby v2.7で追加されたパターンマッチについてキャッチアップした。

[https://zenn.dev/ksss/scraps/a82a629826fdf6](https://zenn.dev/ksss/scraps/a82a629826fdf6)

まだうまく使える場面に出会えてはないが、チャンスを虎視眈々と狙えるぐらいにはなれた気がする。

# GraphQL

以前から使ってみたいと思いつつ、新プロジェクトを始める機会を得たのでなんとなく使ってみた。

印象としては、結構大規模なプロダクトを整理するみたいな使い方のほうがいい気がする。
結局mutationなんか特に実装がRPCになるし、フロントエンド側の習熟も若干必要。

しかしながらRESTっぽくリソースを用意して、これらを組み合わせる感じでAPIを組めばサーバー側はコードが上手くまとまる気がする。

RelayのConnection型を使うなら、気をつけないとlimitが効かなくてサーバー側で全件取得になる危険性がある。resolverではRelationを返して、TypeでActiveReocrdとレスポンス形式の間を取り持ってあげるのが良さそう。

# RailsのDelegated Type

Rails6.1から入ったっぽいActiveRecordのレコード関連付けに関する機能
[https://github.com/rails/rails/pull/39341](https://github.com/rails/rails/pull/39341)

[https://edgeapi.rubyonrails.org/classes/ActiveRecord/DelegatedType.html](https://edgeapi.rubyonrails.org/classes/ActiveRecord/DelegatedType.html)

STIでJSON dataにする方法だとDBの機能が使えないし、テーブルを分けると一覧で取得するのが大変になってしまうのでちょうど困っていたところ、

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Delegated typesによってSTIは過去のものになってしまったな。</p>&mdash; Akinori MUSHA (@knu) <a href="https://twitter.com/knu/status/1369921851854495745?ref_src=twsrc%5Etfw">March 11, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

というtweetをみかけてググってみると、見事に問題を解決するソリューションだった。なんで思いつかなかったんだという発想だけど、ちょうどRails6.1だし使ってみてる。

GraphQLと組み合わせて、Union型ではなく単一の型に合わせてみてる。
集約するTypeを用意して、fieldを定義して、このfieldに合うようにmethodを定義していく。
resolverではRelationを返すと、GraphQLがConnectionのインターフェースに沿ってlimit等を設定してくれるのでこれに乗っかる。
Typeは以下のような感じにしている。

```rb
module Types
  class MainType < BaseObject
    field :kind, String, null: false
    field :subject, String, null: false
    field :body, String, null: false

    def kind = object.nable.class.name.split('::').last
    def subject = object.nable.subject
    def body = object.nable.body

    using Module.new {
      refine Sub1 do
        def subject = "サブ1"
        def body = sub1_column1.to_s
      end

      refine Sub2 do
        def subject = "サブ2"
        def body = "#{sub2_colmun1}:#{sub2_column2}"
      end

      refine Sub3 do
        def subject = "サブ3"
        def body = "(#{sub3_colmun1})"
      end
    }
  end
end
```

こうするとModelはまったく触らず、GraphQLのことはGraphQL内に閉じれる。コードも1 fileにまとまる。

でも一定以上複雑になると対応できなさそう。これでどこまでいけるか。

# AWS Amplify

小さいプロジェクトの実装を任されたが、横断型のプロジェクトなのでコンテキストを分かっているシニアエンジニアがコードの雛形を作ってくれた。これがAWS AmplifyとReactでできていて、急いでキャッチアップした。
最初はAWS版のFirebaseかなと思っていたけど、そもそもFirebaseのことはよく分かってない。
調べていくうちに、アレもできるコレもできると書いてあるので、「もしかしてRailsもいらなくなるのでは？」と思ったけど、更に調べるとそんなことはなかった。

自分なりの解釈だと、AWS Amplifyはフロントエンジニア向けのサービスで、SPAやネイティブアプリのデプロイがgit pushだけでできるようになっている部分がメイン。
そこに付け足しで、Cognitoでの認証だとか、LambdaでのFunctionだとか、AppSyncとDynamoDBでデータベースだとか、EC2というサーバーを使わずにサーバーレスでやれる事をサポートしている感じ。
でもやっぱりサーバー置いたほうが柔軟性はあるので、シンプルな用途向けかなと思った。

しかしながら、SPAを簡単にdeployして他の人にレビューしてもらう使い方なんかはとても便利そうなので、簡単な部分はAWS Amplifyで管理して、複雑な部分はサーバーを置いてAPIで通信することで、サーバーレスとサーバーアリ(何て言うの？)を組み合わせると良さそう。

# Next.js

なんとなく以前からTLで名前は見かけていて、フロントを書く機会も得られたので学んでみた。

そもそもSPAを分かってなくて、Reactも分かってなくて、Reduxも分かってなくてと、かなり覚えることはあったけど、このblogをNext.jsで作れるぐらいには習得できた。
routingをファイルの配置だけでやるのが初学者的にすごく楽だし、よく分かってないwebpackだとかの設定もいい感じにやってくれる。らしい。

と、よく分かってなくてもどんどん作っていけるのが、初心者にとっての魅力の一つだと思う。
最終的に先程のAWS AmplifyのプロジェクトもNext.jsで書いてdeployした。

# SPA

そもそもRailsで言うview層をネイティブアプリみたいに動かすという発想がなくて、ここから新鮮だった。
そして、ちょうど仕事でもバックエンドとフロントエンドでの分業に悩んでいて、SPAにすればフロントエンドをまるっと別の人に任せることができて、Rails側もよく分かってないnode環境を完全になくすことができる。この試みは今の所成功していると思う。

規模やメンバーによってやりやすい開発方法は変わるだろうけど、今の自分の状況には合っていた。

# React

これまでVueを使っていたけど、大して理解していなくてなんかJSに値渡すやつぐらいの認識だった。

しかしながらNext.jsを学んでいくにあたって、関数にするだけというシンプルで覚えやすいcomponent化の方法だったりとか、「選択肢を選んだらボタンを有効化する」みたいなインタラクティブな挙動も作りやすく、「これがGUIプログラミングかー」とまるっきり新しいパラダイムを学ぶことができた。

# Redux/Redux Toolkit

「そもそも状態って何？」みたいな初心者だったので概念を把握するのに苦労した。

この記事がかなり分かりやすくて助かった。

[https://www.hypertextcandy.com/learn-react-redux-with-hooks-and-redux-starter-kit](https://www.hypertextcandy.com/learn-react-redux-with-hooks-and-redux-starter-kit)

自分なりの解釈では、「SPA全ページで使えるグローバル変数みたいなやつ。グローバル変数だけどアクセスの仕方を制限してデバッグとかしやすくしてる」みたいな理解。

ReduxとRedux Toolkitの違いはよく分かってない。

# tailwindcss

[https://tailwindcss.com/](https://tailwindcss.com/)

最近のCSSはこんな感じなんかと体感できる。
style直書きみたいなノリでclassに小さいスタイルを書いていく。なのでオリジナルのclassをほとんど作らなくていい。vscodeとの連携もできてるし、最近のversion upで変更がめちゃくちゃ早く反映されるので開発体験がいい。

# Cookie

恥ずかしながらCookieのことすらろくに分かってなかった。でも認証って触る機会はあんまりないし、だいたいフレームワークがなんとかしてくれるので、意外とプリミティブな部分は分からず使ってる人も多いのでは？Cookieについては別エントリにまとめたい。
