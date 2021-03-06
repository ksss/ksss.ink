---
title: Blog.new('ksss')
date: '2021-03-05'
---

# せっかくNext.jsを学んだのでblogを作ってみた。

仕事でフロントを触る機会があり、興味があってNext.jsを軽く学んでみた。

Next.jsを学んでいると必ず出てくるのがvercelというワード。
出てくるのは当たり前で、Next.jsを開発しているのがvercel社、ということらしい。

vercelというのはサービス名でもあって、これを使えば無料でNext.jsで書いたものをホスティングできるっぽい。
できるっぽいというか、既にできたものがこのページだ。
この記事もmarkdownで書いて、JSのライブラリでHTMLに変換しているらしいが、ほとんどのコードはコピペで作っているのであんまりよく分かってない。

React歴0から付け焼き刃で`create-next-app`から使ってみている。どうやら`create-react-app`で作るやり方もあるらしいけど違いはあんまりわからない。ただ、「ファイルパスがそのままURLになる」という機能はNext.jsのものらしい。通常ならルーティングを書かなければいけないらしいが、Next.jsではそれが不要。Railsで言うroutes.rbが不要になっている。初学者としてはルーティングの書き方を覚えなくて済むのでこれだけでも十分便利。他にもやらなくて良くなっていることがいっぱいありそう。Next.jsはサーバーもクライアントもどっちのviewもまかなえるのが特徴らしいけど、クライアントだけを見ても十分便利なので、初学者から見ると`create-react-app`で始める意義がよく分からない。

ReactのJSXもblog用途だとほぼテンプレートエンジンだなあ。パーツパーツで関数っぽくまとめられるのがよい。topが1 tagに限定されているのでHTMLっぽい。タグの内側も任意に書ける。明示的にimportしてるのでコードを追いやすい。

vercelならGitHub.comにpushしたら、そのまま自動的に公開される。しかもAnalyticsまでついてくる。お金を払えばLambdaでちょっとしたサーバー処理もできる。

httpsも無料でLet's Encryptを使ってやってくれる。

すごい。

# コンプレックス

私は、コンプレックスとして「自分のホームページを作ったことがない」というものがあった。
自分のホームページを持っている人への憧れがあった。

「自分のホームページ」とは何か？
「自分のホームページ」と呼べる条件が自分の中でなんなのか整理してみた。
おそらく、条件にはスペクトルがあり、どこかで線を引くべきだろう。

## Hatena blogは「自分のホームページ」か？

これは自分的にNOだった。

手軽に文章を書いて無料で公開して、お世話になっているHatena社に還元できるとあって、長く使っていた。
これからも使うかもしれない。
しかし、コンプレックスは解消されなかったのである。

## 自鯖立てて運用すれば「自分のホームページ」か？

これはYESだろうと思う。サーバーも物理だろうがクラウドだろうがなんでもいい。
しかしながら、気軽に始めるには結構大変そうっていうかめんどくさそうだった。
気軽に文章を公開したいと言う欲は、既にHatena blogで解消されているため、残りは自己満足でしか無い。

## vercelに上げたものは「自分のホームページ」か？

この辺が絶妙なラインで、無料であること、GitHubにpushすればdeployできること、Next.jsが使いやすいことなどがあり、ある程度の気軽さはある。
HTML、CSS、JavaScriptは、ライブラリの手は借りてはいるが、自分で書いている満足感もある。

しかしながらご覧の通り、デザインはからっきしだ。og:imageもvercelに乗っかってる。RSSフィードもない。ここから先はめんどくさいゾーンに入ってしまう。ちょっとずつ作っていく感じかなあ。

# ともかく

「自分のホームページ」感は結構出てる気がする。
いわゆる平成のホームページ感。
手軽なノスタルジーの摂取。

いい時代になったもんですね。
