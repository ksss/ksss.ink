---
title: TestingにおけるPattern-Matchingの有用性を探る研究
date: '2021-05-13'
---

# はじめに

Ruby v2.7から利用可能になったPattern-Matchingについて、効果的な使い方はないかと考え続けて、ようやく実務でも使えそうなパターンを見つけたので紹介するとともに、その効果を検証する。

# Testing

Testingとは、プログラミングにおける自動テスト、およびそのためのコードのこととする。
フレームワークによって実行されることが多く、フレームワークには[test-unit](https://test-unit.github.io/)、[RSpec](https://rspec.info/)等がある。

テストコードに求められる要件として、

- 書きやすさ
- 読みやすさ
- 見やすさ

があげられる。(個人の意見)

## 書きやすさ

テストコードを書くことはしばしばソフトウェアプログラマーからめんどくさがられ、悩みのタネであると思われる。
最近では[Autify](https://autify.com/)等の登場によって、ある程度の負荷軽減が今後見込まれるが、それでもソフトウェアプログラマーはテストコードは書き続けなければならないだろう。
APIが少ない、または覚えやすいことも重要だ。「こういう場合どうかけばいいんだっけ？」と調べる時間はしばしば工数計算を狂わせる。(データなし)
「できればチェックしたいことはあるんだけど、APIを調べるのが面倒くさいから大まかにチェックだけして細かい部分はチェックしないでいいや。」なんてこともあるかもしれない。
もしテストコードが簡単に書くことができれば、その分「テストパターンは網羅できているか？」のような本質的な問題に意識を集中することができる。

## 読みやすさ

書きやすさも重要だが、読みやすさも重要だ。テストコードのほとんどは、1回書いたら100回以上読まれるだろう。(データなし)
複雑なAPIが使われていると、読み手に「このテストコードはどういう意味だ？」と思われ、また調べる時間が発生し、また工数計算が狂わされる。
できるだけ汎用的な知識だけでテストコードを読むことができれば、「何をテストしたいのか？」のような本質的な問題に意識を集中することができる。

## 見やすさ

テストコード書くときはどんなときか。新機能を追加するときは、TDDであればまずテストが落ち、Diffを目にするだろう。また、コード修正をした場合もテストコードが既存のコードとの挙動の違いを教えてくれる訳だが、ここでもDiffを目にする。
特にArrayやHash等のコンテナ型の比較では、Diffの読みやすさ次第で、作業効率が大きく変わるだろう。(データなし)

# Pattern-Matching

Pattern-MatchingはRuby2.7から導入された機能で、case-when文をよりリッチにした構文のイメージだ。
また、変数へのアサインも同時にやってくれる。

単純な例

```rb
case 42
in Integer => i
  puts i
end
#=> 42
```

Arrayを使った例

```rb
case [1, 2, 3]
in [a]
  p [a]
in [a, b]
  p [a, b]
in [a, b, c]
  p [a, b, c]
end
#=> [1, 2, 3]
```

Pattern-Matchingについてのより詳しい説明は割愛する。参考文献の書籍を参照するとよい。

## One-line pattern matching

Pattern-Matchingは`case`を使わずに1行で記述することもできる。

```rb
# 2.7では `in`
{a: 1, b: 2, c: 3} in {c:}
# 3.0では `=>`
{a: 1, b: 2, c: 3} => {c:}

p c #=> 3
```

One-lineで使う場合は、分岐のためというよりは、変数捕縛やassertionとしての意味合いが強い。(個人の感想)

# Testing meets Pattern-Matching (with GraphQL)

本校で提案したいのは、TestingとOne-line pattern matchingの組み合わせである。
特に[GraphQL](https://graphql.org/)のようなJSONを返すWebAPIのテストで有用性が発揮できることが見込まれる。

比較としてRSpecでの記述を用いるが、本校ではRSpecへの批判的なメッセージは一切ないと明言する。
RSpecは私の浅い経験上、チーム開発をする上で最も利用頻度の多いTestingフレームワークであると確信する。

例としては以下の通り。
サンプルとなるコードは[GraphQLのサイト](https://graphql.org/learn)から借りている。

## 前提

Ruby3を用いる。

JSONを返すWebAPIのテストでは、複雑にネストしたHashやArrayの構造をチェックする必要がある。

比較は単に文字列比較だけでなく、classチェックも同時に行う。

以下のようなデータのチェックする場合を例にする。

```rb
result = {
  data: {
    hero: {
      name: "R2-D2",
      friends: [
        {
          name: "Luke Skywalker"
        },
        {
          name: "Han Solo"
        },
        {
          name: "Leia Organa"
        }
      ]
    }
  }
}
```

## 書きやすさ

テストにおいて重要だと示した書きやすさについてのみ調査する。
書きやすさを表す客観的な指標として、「空白と改行を除く文字数」とした。
テストコードの`$_.gsub(/[\n\s]/, '').length`を計測する。

### RSpec

これぐらいであれば、一度にチェックしてみてもいいので試みた。

```rb
expect(result).to match({
  data: {
    hero: {
      name: "R2-D2",
      friends: [
        {
          name: kind_of(String)
        },
        {
          name: "Han Solo"
        },
        {
          name: "Leia Organa"
        }
      ]
    }
  }
})
```

classチェックに`kind_of`を使用した。
さらに`eq`ではなく`match`を使用しないと、`kind_of(Array)`の場合に期待通りに動作しなかった。`match`にしてみると期待通り動作したので、おそらく`kind_of`を使用するなら`match`を使用しなければならないのだろう。

一度にチェックするのではなく、段階的なチェックを試みる。
friendsのチェックとそれ以外に分けてみる。
先にfriends以外の構造を調べるように修正してみる。

```rb
expect(result).to match({
  data: {
    hero: {
      name: "R2-D2",
      friends: kind_of(Array)
    }
  }
})
expect(result.dig(:data, :hero, :friends)).to match([
  {
    name: kind_of(String)
  },
  {
    name: "Han Solo"
  },
  {
    name: "Leia Organa"
  },
])
```

`:friends`keyの値については後で詳しく調べるので、一旦`kind_of(Array)`とした。
`:hero`の中身が`:name`と`:friends`の2つのkeyで構成されていることはチェックできているはずだ。
`Hash#dig`を用いて`:friends`keyの値を取り出すことで、チェックを2つに分けることが出来た。
文字数は**187**だった。

### Pattern-Matching

Pattern-Matchingを用いて、RSpecの場合と同じことを試みる。

```rb
result => {
  data: {
    hero: {
      name: "R2-D2",
      friends: [
        {
          name: String
        },
        {
          name: "Han Solo"
        },
        {
          name: "Leia Organa"
        }
      ]
    }
  }
}
```

これでテストが落ちれば`NoMatchingPatternError`が発生する。
RSpecのときのように、段階的なチェックに書き直しを試みる。

```rb
result => {
  data: {
    hero: {
      name: "R2-D2",
      friends: friends,
    }
  }
}
friends => [
  {
    name: String
  },
  {
    name: "Han Solo"
  },
  {
    name: "Leia Organa"
  }
]
```

パータンマッチの構文を利用して、`friends`を一旦変数に入れ、後で詳しく調べている。
特別なAPIを調べること無く、意識した順番通りに記述することが出来た。
文字数は**114**だった。

## 読みやすさ

書きやすさの項で示したコードについて、読みやすさを見ていく。
読みやすさの指標として、「使用しているmethodの数」を調査した。「使用しているmethodの数」が少ないほど、コード理解のために必要な知識が減るので、読みやすいと筆者は考える。

### RSpec

```rb
expect(result).to match({
  data: {
    hero: {
      name: "R2-D2",
      friends: kind_of(Array)
    }
  }
})
expect(result.dig(:data, :hero, :friends)).to match([
  {
    name: kind_of(String)
  },
  {
    name: "Han Solo"
  },
  {
    name: "Leia Organa"
  },
])
```

使用しているmethod数は

- `expect`
- `to`
- `match`
- `kind_of`
- `dig`

の**5つ**だった。

### Pattern-Matching

```rb
result => {
  data: {
    hero: {
      name: "R2-D2",
      friends: friends,
    }
  }
}
friends => [
  {
    name: String
  },
  {
    name: "Han Solo"
  },
  {
    name: "Leia Organa"
  }
]
```

使用しているmethod数は**0**だった。

## 見やすさ

同じくテストが失敗した場合のDiffの見やすさも見ていく。
テスト実行土台はRSpecを想定し、friendsに不一致があった場合を想定している。
見やすさの指標は定数化しづらいので、独断とする。

### RSpec

```bash
  1) Test is expected to match {:data=>{:hero=>{:friends=>[{:name=>"Luke-Skywalker"}, {:name=>"Han-Solo"}, {:name=>"Leia-Organa"}], :name=>"R2-D2"}}}
     Failure/Error:
       expect(result.dig(:data, :hero, :friends)).to match([
         {
           name: kind_of(String)
         },
         {
           name: "Han Solo"
         },
         {
           name: "Leia Organa"
         },

       expected [{:name=>"Luke-Skywalker"}, {:name=>"Han-Solo"}, {:name=>"Leia-Organa"}] to match [{:name=>#<RSpec::Mocks::ArgumentMatchers::KindOf:0x0000aaaac33997c0 @klass=String>}, {:name=>"Han Solo"}, {:name=>"Leia Organa"}]
       Diff:
       @@ -1 +1 @@
       -[{:name=>kind of String}, {:name=>"Han Solo"}, {:name=>"Leia Organa"}]
       +[{:name=>"Luke-Skywalker"}, {:name=>"Han-Solo"}, {:name=>"Leia-Organa"}]
```

RSpecの機能によりテストコードがそのまま上部に表示されている。
さらに、期待値と実測値がDiffとして上下に並んでいる。

### Pattern-Matching

```bash
  1) Test
     Failure/Error:
       friends => [
         {
           name: String
         },
         {
           name: "Han Solo"
         },
         {
           name: "Leia Organa"
         }

     NoMatchingPatternError:
       [{:name=>"Luke-Skywalker"}, {:name=>"Han-Solo"}, {:name=>"Leia-Organa"}]
```

上にパターンとして書いたテストコード、下に入力された実際の値が表示される。

パターン構文はDiffとしては表示されず、入力値のみで差分が並ばない。

# 考察

## 書きやすさ

書きやすさの指標は文字数で、以下のような結果となった。

- RSpec: 187
- Pattern-Matching: 114

今回のケースでは、単純な文字数ではPattern-Matchingの方が少ないため書きやすいのではないかと考えられる。
より複雑なチェックをしたい場合は、APIが豊富なRSpecの方が記述量が逆転する可能性もあるが、殆どのテストケースはシンプルなもので占められていると予想する。(データなし)
もちろん「書きやすさ」という観点は多分に主観的なものだと考えられるが、この短いチェックで3:5程の記述量の差が出てくることは注目すべきだろう。

## 読みやすさ

読みやすさの指標はmethod数で、以下のような結果となった。

- RSpec: 5
- Pattern-Matching: 0

いささかズルい指標かもしれないが、定量化できる指標としては注目すべき数字だろう。
実際はmethod一つ一つの意味を覚えることと、Pattern-Matching構文を覚えることの差分になるだろう。

## 見やすさ

見やすさにおいては定量的な指標はないが、RSpecの方が上下に差分が表示されているため、間違いに気づきやすい。
これはRSpecの実装がこの差分表示に力を入れている点が大きい。

# さらなる観点

今回、TestingにおけるPattern-Matchingの有用性を示す指標として、「書きやすさ」「読みやすさ」「見やすさ」を大きな基準とした。
しかしながら、大きくはなくとも考慮する必要があるトピックも多数ある。

## aggregate failures

Pattern-Matchingを用いたTestingは、例外を発生させているため、複数のチェック項目が並んでいた場合に、以降のチェックが実行されない問題がある。
この問題を解決するために、`rescue NoMatchingPatternError`を使う案が考えられるが、その場合、Pattern-Matchingの有用性である変数捕縛が使えなくなってしまい、結局複数チェックができなくなってしまう。

```rb
def pattern_matching
  yield
rescue NoMatchingPatternError => e
end

pattern_matching {
  result => { users: users }
}

pattern_matching {
  users => [{name: 'foo'}]
}
#=>  undefined local variable or method `users' for main:Object (NameError)
```

## 理解障壁

今回の比較では、One-line pattern matching構文を用いた。

Pattern-Matchingは構文さえ理解していれば意味はわかるが、その構文理解がチーム開発での導入障壁になると考える。

事実、筆者も本を2冊ほど読み、よく調べてから初めてその意味合いが分かった。

ピン演算子なども絡んでくると、Ruby2.6までのRubyしか書いたことがないユーザーには、コードを読み解くのに時間がかかるかもしれない。

## Experimental

Ruby3時点でのPattern-Matchingは、case-in文はExperimentalではなく正式サポートとなったが、One-lineはまだExperimentalであり、普通に使用するとwarningが表示される。

そのためproductionで導入する強い理由になりにくいと思われる。
しかしながら、テストコードであれば、それほど怖がらずに導入する事ができるのではと筆者は考える。

## 構文の制限

Pattern-Matching構文では、Hashは全てSymbol keyでなければならない。

よってJSONを返すようなWebAPIのテストでは、毎回`result.to_h.deep_symbolize_keys => {...}`のように、全てSymbol keyに変換してから比較する必要がある。

String keyを使う場合は`result => { "a" => 42 }`のように`=>`を使うことになるが、`=>`は、Pattern-Matchingにおける変数捕縛を行うAsパターン構文とぶつかるた、構文レベルで利用できない。

また、ピン演算子を使って`result => { id: ^user.id.to_s }`のようにしたくなるが、これは構文エラーとなる。

以下のように、一旦別の変数に入れてあげる必要がある。

```rb
user_id = user.id.to_s
result => { id: ^user_id }
```

## 併用

Pattern-Matchingの真価はRuby構文なので、あらゆるTestingフレームワークで使用することができる点にあると考えている。

よって、複雑なHash構造はPattern-Matchingで分解・チェックしつつ、シンプルなObjectに落とし込めたら各Testingフレームワークが持つAPIを使用することでDiffの見やすさに配慮するというハイブリッドな構成も可能である。

# まとめ

書きやすさと読みやすさの点で、Pattern-Matchingは定量的な優位性を示した。

しかしながら、Pattern-MatchingはそもそもTestingのための機能ではないので、見やすさの点ではRSpecの方が優位と言える。

よって、複雑な構造を段階的にチェックし、シンプルなデータにまで落とし込めたらTestingフレームワークでチェックしていくという併用が、現状手を打ちやすい手法なのではないかと考える。

```rb
# friends以外のチェック
result => {
  data: {
    hero: {
      name: "R2-D2",
      friends: friends,
    }
  }
}

# friendsが3要素か数チェックしつつ変数にアサイン
friends => [f1, f2, f3]

# フレームワークの機能を使って、落ちた場合のDiffを見やすく
expect(f1).to match({
  name: kind_of(String)
})
expect(f2).to eq({
  name: "Han Solo"
})
expect(f3).to eq({
  name: "Leia Organa"
})
```


# 参考文献

- [n月刊ラムダノート Vol.1, No.3(2019)](https://www.lambdanote.com/products/nmonthly-vol-1-no-3-2019)
- [プログラミングElixir](https://www.amazon.co.jp/dp/B01KFCXP04/)

筆者のパターンマッチの知識はこの2冊の書籍によって得たものがほとんどだ。

- [ExUnitの`assert`でパターンマッチを用いて複雑なデータ構造をテストする](https://qiita.com/kentaro/items/477c92a57c8aaf694251)

この記事が、TestingでPattern-Matchingを利用するという発想の元となった。
