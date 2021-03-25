---
title: 日本語og-image
date: '2021-03-25'
---

日本語に対応したog-image生成サービスを作ってみた。

[https://og-image-qqmw83jkp-ksss.vercel.app/](https://og-image-qqmw83jkp-ksss.vercel.app/)

(ドメインは後でいい感じにしたい。)

レシピは簡単。vercelを使っただけだ。

### 1. [vercel/og-image](https://github.com/vercel/og-image)をforkする

リポジトリにあるvercelボタンでは、forkじゃなくなるなどいい感じにならなかった。

### 2. [README.md](https://github.com/vercel/og-image#deploy-your-own)に書いてあるとおりに作業する

- localのnode versionをvercelで使えるversionに揃える。今回は14.Xだった。
- fork直後のコードが環境変数`AWS_REGION`を見てlocalなのかproductionなのか判断しているので、localで`AWS_REGION`を設定されているとproductionとして動くので `Error: Failed to launch the browser process! spawn /usr/bin/chromium-browser ENOENT` というエラーが出る。aws lambda上でchromiumを動かすコードが動いているようだ。解決策として別の環境変数を設定して、vercel上で環境変数を設定した。

### 3. vercelにdeployする

おわり
