# RecollectionMode.js

## 概要

アドベンチャーゲーム等でよく見られる「シーン回想」や「CG閲覧」といった  
いわゆる「回想モード」機能を追加するプラグインです。
ツクールMVが届いた嬉しさのあまり、勉強がてら作成してみました。


## スクリーンショット

* タイトル画面へのメニューの追加

![スクリーンショット-タイトル](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection00.png)


* 「回想モード」の表示

![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection0.png)


* 閲覧する回想を選択

![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode.png)

## デモ1: 通常

[RecollectionMode](http://www.rinsymbol.sakura.ne.jp/tkool/mv/Project2/)

## デモ2: 回想スイッチの共有オプションあり

[RecollectionMode-回想スイッチ共有](http://www.rinsymbol.sakura.ne.jp/tkool/mv/Project2-share_switch/)


### ライセンスについて

このプラグインはMITライセンスのもとで公開されています。
詳細については、LICENSE.txtをご覧ください。


## 利用について

非商用/商用ゲーム問わずにご利用いただけます。
年齢制限のあるコンテンツでのご利用も可能です。
利用報告は必要ありません。



## サンプルプロジェクトについて

このリポジトリ自体がサンプルプロジェクトとなっております。  
「Download ZIP」より、ファイルをダウンロードして、RPGツクールMVで開いてください。


## 使い方

1. RecollectionMode.jsをダウンロードし、```ツクールプロジェクト/js/plugins/```に配置します
2. ```ツクールプロジェクト/img/pictures/``` に対して、画像ファイルを配置します
   * 以下のリンクの画像を保存し、上記ディレクトリに配置します。   
     [never_watch_picture.png](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/never_watch_picture.png)
   * 加えて、回想モードに利用する画像を用意し、配置します
ここでは、```a.png```と```b.png```を配置したものとします

3.  ```ツクールプロジェクト/audio/bgm``` に対して、音楽ファイルを配置します  
   * 以下のリンクの音楽を保存し、上記BGMディレクトリに配置します。  
     [blank_memories.ogg](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/blank_memories.ogg)
4. RecollectionMode.jsの```60行目```にある```rec_cg_set```に対して、以下の設定を行います
   * picturesに、先ほど配置した画像の指定を行います(.pngの拡張子は省略してください)
   ```javascript
   "pictures": ["a", "b"],
   ```
   * thumbnailに、回想一覧のサムネイルを指定します。
   ```javascript
   "thumbnail": ["t"],
   ```
5. 回想イベントとして呼び出す「コモンイベント」の番号を指定します
   * common_event_idに1を指定します
   ```javascript
   "common_event_id": 1,
   ```

6. 回想が見れるようになる条件(スイッチ)を指定します
   * switch_idに1を指定します  
   (※自由なスイッチ番号が指定できます。コモンイベント番号と一致している必要はありません)
   ```javascript
   "switch_id": 1
   ```

7. 回想用のマップを設定します
   * ```109行目```にある ```sandbox_map_id``` が1になっていることを確認します  
   ```javascript
   "sandbox_map_id": 1
   ```
   * プロジェクト作成時に存在する「MAP001」の内容を以下のようにクリアします
     * 設定前
       ![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode_before.png)
     * 設定後
          ![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode_after.png)

8. [5]で指定したコモンイベントを作成します   
   * 下記画像のようにコモンイベントの1番目に、回想用イベントを作成します。ここではa.pngとb.pngを画面に表示します
   ![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode_exp_common_event.png)

   * 【！重要！】コモンイベントの一番最後の行に、「スクリプト」として以下の記述を行います  
   ![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode_plugin_add_script.png)
   ```javascript
   Scene_Recollection.prototype.rngd_exit_scene();
   ```

9. [6]で指定したスイッチをONにするイベントを作成します
   * 新たにマップを作成し、下記画像のようにイベントを作成します
      ![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode_exp_switch_on.png)
   * 設定後のマップイメージ
      ![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode_map002.png)      

10. プラグイン管理で、RecollectionMode.jsを有効にします
   * 下記画像のようにプラグインを有効にします  
      ![スクリーンショット](http://www.rinsymbol.sakura.ne.jp/tkool/mv/github_images/recollection_mode_plugin_manage.png)

11. ゲームを起動します。[9]で作成したイベントと会話し、ゲームを「セーブ」してタイトル画面に戻ります。
    すると、CGと回想が見れる状態となります。



## パラメータ説明

このプラグインファイルの「プラグイン設定」を書き換えることで、
各種動作に関する設定を実施することができます。

### rec_cg_set


```javascript
//---------------------------------------------------------------------
// ★ 回想用のCGを指定します
//---------------------------------------------------------------------
// 形式
//  番号: {
//    "title": "回想名",
//    "pictures": ["画像1", "画像2"],
//    "common_event_id": コモンイベント番号,
//    "switch_id": スイッチ番号,
//    "thumbnail": "サムネイル名"
//  }
//---------------------------------------------------------------------
"rec_cg_set": {
    1: {
        "title": "回想シーン1",
        "pictures": ["room1", "room2"],
        "common_event_id": 1,
        "switch_id": 1,
        "thumbnail": "room1_thumbnail"
    },
    2: {
        "title": "回想シーン2",
        "pictures": ["background1_22", "background1_24"],
        "common_event_id": 2,
        "switch_id": 2
    },
}
```


|項目名|項目内容|
|---|---|
|title|回想シーンのタイトルを指定します|
|pictures|CGモードに表示する画像を指定します。[img/pictures]配下の画像を指定します。後述のthumbnailプロパティを指定しない場合はpicturesの先頭に指定した画像がサムネイルになります。|
|common_event_id|回想シーン選択時に呼び出すコモンイベントのIDを指定します|
|switch_id|回想シーンが表示されるための条件スイッチIDを指定します。該当のスイッチがONになった場合に回想が見れるようになります。|
|thumbnail|サムネイル画像を指定します。[img/pictures]配下の画像を指定します。|


## オプション

その他オプションプロパティです。
BGMの変更や表示列、行の変更等が行えます。

### sandbox_map_id

```javascript
//---------------------------------------------------------------------
// ★ 回想時に一時的に利用するマップIDを指定します
//---------------------------------------------------------------------
// 通常は何もないマップを指定します
//---------------------------------------------------------------------
"sandbox_map_id": 1,
```

|項目名|項目内容|
|---|---|
|sandbox_map_id|回想表示用のマップIDを指定します。通常は何もないマップIDを指定します。|

### share_recollection_switches

```javascript
//---------------------------------------------------------------------
// ★ 回想用スイッチをセーブデータ間で共有するかどうかを指定します
//---------------------------------------------------------------------
// パラメータの説明
// true:
//      回想用スイッチを共有します。
//
//      例1：セーブ1で回想スイッチ1, 2, 3がONとする
//          ニューゲームで開始し、セーブ1を上書きする
//          →セーブ1の回想スイッチ1, 2, 3はONのままとなる。
//
//      例2: セーブ1で回想スイッチ1, 2, 3がONとする
//          セーブ1をロードし、セーブ2を保存する
//          セーブ2で回想スイッチ1, 2, 3, 7がONとする
//          セーブ1, セーブ2それぞれで、回想スイッチ1, 2, 3, 7がONとなる
//
// false:
//      回想用スイッチを共有しません
//
// trueの場合、
// すべてのセーブデータを削除した場合にのみ、スイッチがリセットされます
//---------------------------------------------------------------------
"share_recollection_switches": false
```

|項目名|項目内容|
|---|---|
|share_recollection_switches|回想用スイッチをセーブデータ間で共有するかどうかを指定します。(true: 共有する, false:共有しない)  <br><br>例1：セーブ1で回想スイッチ1, 2, 3がONとする<br>  ニューゲームで開始し、セーブ1を上書きする<br>  →セーブ1の回想スイッチ1, 2, 3はONのままとなる。<br><br>例2: セーブ1で回想スイッチ1, 2, 3がONとする<br>  セーブ1をロードし、セーブ2を保存する<br>  セーブ2で回想スイッチ1, 2, 3, 7がONとする<br>→セーブ1, セーブ2それぞれで、回想スイッチ1, 2, 3, 7がONとなる|



### rec_mode_bgm

```javascript
//---------------------------------------------------------------------
// ★ 回想モードで再生するBGMの設定をします
//---------------------------------------------------------------------
"rec_mode_bgm": {
    "bgm": {
        "name"  : "blank_memories",     // BGMファイル名を指定します
        "pan"   : 0,
        "pitch" : 100,
        "volume": 90
    }
},
```
|項目名|項目内容|
|---|---|
|name|回想シーンで再生するBGMを指定します|
|pan|BGMの再生位置（左右）を指定します|
|pitch|BGMの再生速度を指定します|
|volume|BGMの再生ボリュームを指定します|

### rec_mode_window
```javascript
//---------------------------------------------------------------------
// ★ 回想CG選択ウィンドウの設定を指定します
//---------------------------------------------------------------------
"rec_mode_window" : {
    "x": 260,                           //
    "y": 180,
    "recollection_title": "回想モード",
    "str_select_recollection": "回想を見る",
    "str_select_cg": "CGを見る",
    "str_select_back_title": "タイトルに戻る"
},
```
|項目名|項目内容|
|---|---|
|x|回想CG選択ウィンドウのx座標を指定します|
|y|回想CG選択ウィンドウのy座標を指定します|
|recollection_title|回想モード自体の表示名を指定します|
|str_select_recollection|「回想を見る」メニューの表示名を指定します|
|str_select_cg|「CGを見る」メニューの表示名を指定します|
|str_select_back_title|「タイトルに戻る」メニューの表示名を指定します|

### rec_list_window
```javascript
//---------------------------------------------------------------------
// ★ 回想リストウィンドウの設定を指定します
//---------------------------------------------------------------------
"rec_list_window": {
    // 1画面に表示する縦の数
    "item_height": 3,
    // 1画面に表示する横の数
    "item_width" : 2,
    // 1枚のCGに説明テキストを表示するかどうか
    "show_title_text": true,
    // タイトルテキストの表示位置(left:左寄せ、center:中央、right:右寄せ）
    "title_text_align": "center",
    // 閲覧したことのないCGの場合に表示するピクチャファイル名
    "never_watch_picture_name": "never_watch_picture",
    // 閲覧したことのないCGのタイトルテキスト
    "never_watch_title_text": "？？？"
},
```

|項目名|項目内容|
|---|---|
|item_height|回想選択において、1ページ内の項目数(行数)を指定します|
|item_width|回想選択において、1ページ内の項目数(列数)を指定します|
|show_title_text|回想選択において、回想の説明テキストを表示有無を指定します(true: 表示する, false:表示しない)|
|title_text_align|回想の説明テキストの位置を指定します。(left:左寄せ、center:中央、right:右寄せ）|
|never_watch_picture_name|閲覧したことのないCGの場合に表示するピクチャファイル名を指定します|
|never_watch_title_text|閲覧したことのないCGの説明テキストとして表示する文字を指定します|



### パッチ

|パッチ名|内容|ダウンロード先|
|---|---|---|
|回想モードOnlyパッチ|タイトル画面から、回想モードに直接飛ぶようにする|[回想モードOnlyパッチ](https://raw.githubusercontent.com/rinne-grid/tkoolmv_plugin_RecollectionMode/master/RecollectionMode/js/plugins/RecollectionMode_through_command_patch.js)|
|CGモードOnlyパッチ|タイトル画面から、CGﾓｰﾄﾞに直接飛ぶようにする|[CGモードOnlyパッチ](https://raw.githubusercontent.com/rinne-grid/tkoolmv_plugin_RecollectionMode/master/RecollectionMode/js/plugins/RecollectionMode_through_command_cg_only_patch.js)|
|スイッチセーブパッチ|セーブデータに、その時点のスイッチ情報を保存することができます。|[スイッチセーブパッチ](https://raw.githubusercontent.com/rinne-grid/tkoolmv_plugin_RecollectionMode/master/RecollectionMode/js/plugins/RecollectionMode_save_switch_patch.js)|
|回想モードをメニューから開くパッチ|回想モードをマップメニューから開けるようにするためのパッチです。なおメニューから回想モードを開き、回想を観てメニューに戻る際、メニューの背景に表示されているマップイメージを復帰することはできません。|[回想モードをメニューから開くパッチ](https://raw.githubusercontent.com/rinne-grid/tkoolmv_plugin_RecollectionMode/master/RecollectionMode/js/plugins/RecollectionMode_back_to_menu_and_title_patch.js)|

### 補助ツール

[RecoGene](http://rinsymbol.sakura.ne.jp/tkoolmv/RecoGene/)

* Web画面上でCG設定を入力し、設定済みのプラグインをダウンロードできます。
* 既存のRecollectionMode.js(バージョン.1.1.2以降)ファイルから、設定を読み込み、編集することも可能です。

### 作者について

[@rinne_grid](https://twitter.com/rinne_grid)