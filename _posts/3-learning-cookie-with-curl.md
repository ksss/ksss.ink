---
title: Learning cookie with curl
date: '2021-03-20'
---

# 新規アプリ作ってます

お仕事で新規アプリを作ってる。

具体的には `rails new` してコードを書いている。

アプリを実装するにあたり、いわゆる認証周りの技術選定をする中で、そもそも認証の仕組みをよくわかってなかった事に気がついた。

普段Webサイトで、最初だけidとpasswordを入力して後は入力しなくてもいいのはなんでだろう？

Web系のプログラマーを10年近くやってきて今まで知らないのはやばいかもしれないと思い調べてみた。

# Session on Rails

[Railsガイド](https://railsguides.jp/action_controller_overview.html#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AB%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B)によると、ふむふむ、難しいことはよくわからんけど、とにかくサインインしたければ`session`オブジェクトに書き込むといいらしい。

```shell
session[:current_user_id] = user.id
```

ここで湧き上がる疑問は、**「なぜこれでいいのか」**

ちょうどHTTP APIを使ったバックエンドアプリケーションを開発していたので、とりあえずcurlしてみた。

```shell
$ curl -i -X POST http://localhost:3000/sign_in -d '...'
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Download-Options: noopen
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: strict-origin-when-cross-origin
Content-Type: application/json; charset=utf-8
Vary: Accept
Set-Cookie: _app_session=...; path=/; HttpOnly; SameSite=Lax
ETag: W/"3f357b434c6759cced5bd7770bfb1728"
Cache-Control: max-age=0, private, must-revalidate
X-Request-Id: 1e16eab9-0da8-44ec-88c1-f4b67a177fd4
X-Runtime: 0.275964
Transfer-Encoding: chunked

{"status":"ok"}
```

なんかよくわからんが`Set-Cookie`という長い文字列を持ったヘッダーが返ってきた。これが怪しい。

# CookieStore

Cookieといえば、[Railsガイド](https://railsguides.jp/action_controller_overview.html#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3)によるとセッションストアなるものがあり、これが選べるらしく、CookieStoreがデフォルトらしい。

セキュリティのことは無視できないので、選択肢がある以上調べなければならない。

そもそもCookieってなんだ。

# Set-Cookie/Cookie

調べてみたところ、`Set-Cookie`ではなく`Cookie`ヘッダーもあるようだ。

試しにcurlで`Cookie`ヘッダーをセットしてみる。値はさっき`Set-Cookie`で返ってきていた値だ。

```shell
$ curl -X POST -H 'Cookie: ...' http://localhost:3000/
```

Railsのコード内で`session[:current_user_id]`を見てみると、なるほど、さっきセットした値が取得できた。

つまりサーバーで`Set-Cookie`ヘッダーにセットした値を、クライアント側でそのまま`Cookie`ヘッダーにつけてあげれば、サーバー側でセットした値を再生できる。だからいちいちidとpasswordを入力しなくても、誰からのリクエストなのか分かる。

こういう仕組みっぽい。おそらくcookieはWebブラウザが内部でファイルに保存してくれて自動的にリクエストヘッダーに入れてくれているんだろう。

これがCookieのプリミティブな仕組みなようだ。

# CookieStore再び

ここでCookieStoreの仕組みを考えると意味がわかる。

idとpasswordを入力したことで得られる`user_id`みたいなアカウントを識別する値をcookieに入れたのがCookieStore。CookieStoreなら情報がクライアント側に保存されるのでDBなりが不要。
cookieを他人に取られても、そのcookieだけを無効化することができないのが弱点。ただし、暗号鍵を変えれば全アカウントの既存のcookieを無効化はできる。

他の方法として、無意味な文字列をcookieに入れて、`user_id`などの情報を別のストアに入れるのが`ActiveRecordStore`なり`MemCacheStore`。これなら1 session毎に無効化などのコントロールが可能。ただし、もちろんDBなりが必要で、データアクセスもリクエスト毎に必要。

Railsのメモリにデータを乗せておくのが`CacheStore`。DBなりが不要になる代わりに、deployのたびに全ユーザーで再サインインが必要になるので小規模向けか。

とスルスル理解できた。

# その先へ

## curlのcookie用オプション

更に調べると、curlにはcookie用のオプションがあるらしい。確かにいちいちヘッダーの値をコピペするのは大変だった。

### Set-Cookieをファイルに保存

```shell
$ curl -h | grep -- -c,
 -c, --cookie-jar <filename> Write cookies to <filename> after operation
```

`-c` or `--cookie-jar`オプションをつければ、指定したファイルにSet-Cookieの内容を保存してくれるっぽい。

### Cookieをファイルからセット

```shell
$ curl -h | grep -- -b,
 -b, --cookie <data|filename> Send cookies from string/file
```

 さらに、この保存したファイルは`-b` or `--cookie`オプションで`Cookie`ヘッダーにセットするとように指定できる。これでいちいちコピペしなくて済みそうだ。

# Cookie on Rails

[Railsガイド](https://railsguides.jp/action_controller_overview.html#cookie)によると`cookies`ヘルパーもある。[実装](https://github.com/rails/rails/blob/a8a1afd45572004c903a7aefaa99640fa13547d4/actionpack/lib/action_controller/metal/cookies.rb)を見ると`request.cookie_jar`でもいいっぽい。

比較にためsessionと同時に使ってみる。

code

```rb
cookies[:cookie_id] = 123
session[:session_id] = 123
```

response

```shell
curl -i -X POST http://localhost:3000/sign_in
...
Set-Cookie: cookie_id=123; path=/; SameSite=Lax
Set-Cookie: _app_session=...; path=/; HttpOnly; SameSite=Lax
...
```

あれ、値丸見えなんですけど。

<br>

<strong class="text-4xl">値丸見えなんですけど！！！！</strong>

<br>

いや[Railsガイド](https://railsguides.jp/action_controller_overview.html#cookie)にも書いてあるんだけど、`cookies`だと暗号化されない。

<br>

<strong class="text-4xl">cookiesだと暗号化されない。</strong>

<br>

今日はこれだけ覚えて返ってください。

# cookies.signed / cookies.encrypted

[RailsのAPI](https://api.rubyonrails.org/classes/ActionDispatch/Cookies.html)によると、`cookies.signed`や`cookies.encrypted`というものがあるようだ。

code

```rb
cookies.encrypted[:encrypted_id] = 123
cookies.signed[:signed_id] = 123
```

response

```shell
Set-Cookie: encrypted_id=mwk5nJI7...; path=/; SameSite=Lax
Set-Cookie: signed_id=eyJfcm...; path=/; SameSite=Lax
```

なるほど。値は読めなくはなった。`encrypted`と`signed`の違いはよく分からないけど、どちらもkey名が見えてしまっている。

どっちにしろ、key名も値も見られず改ざんを防ぐには`session`を使ったほうがいいようだ。

# まとめ

- Cookieは便利。
- セキュリティは大事。

<p class="text-sm">og-image日本語対応させるためには <a href="https://github.com/vercel/og-image">vercel/og-image</a>をforkして独自にdeployすればできるっぽいんだけどその作業がめんどくさ……。</p>
