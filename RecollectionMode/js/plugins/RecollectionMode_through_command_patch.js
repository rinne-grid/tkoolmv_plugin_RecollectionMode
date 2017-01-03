//=============================================================================
// RecollectionMode_through_command_patch.js

// RecollectionMode(https://github.com/rinne-grid/tkoolmv_plugin_RecollectionMode)
// Copyright (c) 2016 rinne_grid
// This plugin is released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:ja
 * @plugindesc RecollectionModeのパッチです。タイトルから直接回想閲覧に遷移します
 * @author rinne_grid
 *
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 */

    // 回想モードのカーソル
    Scene_Recollection.rec_list_index = 0;

    // 回想モードの背景に表示する画像
    Scene_Recollection.background_image_name = "background";

    Scene_Recollection.prototype.createCommandWindow = function() {

        // 回想モード選択ウィンドウ
        this._rec_window = new Window_RecollectionCommand();
        this._rec_window.setHandler('select_recollection', this.commandShowRecollection.bind(this));
        this._rec_window.setHandler('select_cg', this.commandShowCg.bind(this));
        this._rec_window.setHandler('select_back_title', this.commandBackTitle.bind(this));

        // パッチ：選択ウィンドウを非表示にする。通常はここがtrue
        this._rec_window.visible = false;
        this._rec_window.deactivate();
        this.addWindow(this._rec_window);

        // 回想リスト
        this._rec_list = new Window_RecList(0, 0, Graphics.width, Graphics.height);

        // パッチ：回想リストを表示にする。通常はここがfalse
        this._rec_list.visible = true;
        this._rec_list.setHandler('ok', this.commandDoRecMode.bind(this));
        this._rec_list.setHandler('cancel', this.commandBackSelectMode.bind(this));
        this._mode = "recollection";
        this._rec_list.activate();
        this._rec_list.select(Scene_Recollection.rec_list_index);
        this._rec_list.opacity = 0;

        this.addWindow(this._rec_list);

        // CG参照用ダミーコマンド
        this._dummy_window = new Window_Command(0, 0);
        this._dummy_window.deactivate();
        this._dummy_window.visible = false;
        this._dummy_window.setHandler('ok', this.commandDummyOk.bind(this));
        this._dummy_window.setHandler('cancel', this.commandDummyCancel.bind(this));
        this._dummy_window.addCommand('next', 'ok');
        this.addWindow(this._dummy_window);



    };

    //-------------------------------------------------------------------------
    // ● 回想orCGモードから「キャンセル」して前の画面に戻った場合のコマンド
    //-------------------------------------------------------------------------
    Scene_Recollection.prototype.commandBackSelectMode = function() {
        // タイトルに戻る場合は、インデックスをリセットする
        Scene_Recollection.rec_list_index = 0;
        SceneManager.goto(Scene_Title);
    };