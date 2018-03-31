//=============================================================================
// RecollectionMode_back_to_menu_and_title_patch.js
// Copyright (c) 2018 rinne_grid
// This plugin is released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//
// Version
// 1.0.0 2018/03/31 公開
//=============================================================================

/*:ja
 * @plugindesc メニューから回想モードを呼び出せるようにします
 * @author rinne_grid
 *
 * @param コマンド追加位置
 * @desc 回想コマンドを追加する位置です。1:アイテムの下 2: スキルの下 3: 装備の下 4:ステータスの下 5: 並び替えの下...
 * @default 5
 * @type select
 * @option アイテムの下
 * @value 1
 * @option スキルの下
 * @value 2
 * @option 装備の下
 * @value 3
 * @option ステータスの下
 * @value 4
 * @option 並び替えの下
 * @value 5
 * @option オプションの下
 * @value 6
 * @option セーブの下
 * @value 7
 * @option ゲーム終了の下
 * @value 8
 *
 * @param 「回想」コマンドの名称
 * @desc 回想モードに移動するためのコマンド名称として表示される文字です
 * @default 回想モード
 *
 * @param 「戻る」コマンドの名称
 * @desc 回想モードからメニューに戻るためのコマンド名称として表示される文字です。
 * @default メニューに戻る
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 */

    Scene_Recollection.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createWindowLayer();
        this.createCommandWindow();

        var sceneStackLen = SceneManager._stack.length;
        // 1つ前のsceneがScene_Menuの場合、戻り先をメニューとする
        if(SceneManager._stack[sceneStackLen-1].name === "Scene_Menu") {
            Scene_Recollection.returnScene = "menu";
            // 呼び出し前の状態を保存する

            Scene_Recollection.returnGameObjects = {
                system      : JsonEx.stringify($gameSystem),
                screen      : JsonEx.stringify($gameScreen),
                timer       : JsonEx.stringify($gameTimer),
                switches    : JsonEx.stringify($gameSwitches),
                variables   : JsonEx.stringify($gameVariables),
                selfSwitches: JsonEx.stringify($gameSelfSwitches),
                actors      : JsonEx.stringify($gameActors),
                party       : JsonEx.stringify($gameParty),
                map         : JsonEx.stringify($gameMap),
                player      : JsonEx.stringify($gamePlayer)
            };
        // 1つ前のsceneがScene_Titleの場合、戻り先は通常どおりタイトルとする
        } else if(SceneManager._stack[sceneStackLen-1].name === "Scene_Title") {
            Scene_Recollection.returnScene = "title";
        }
    };

    //-------------------------------------------------------------------------
    // ● 「戻る」を選択した際のコマンド
    //-------------------------------------------------------------------------
    Scene_Recollection.prototype.commandBackTitle = function() {
        Scene_Recollection.rec_list_index = 0;
        // メニューに戻る場合、保存したゲームオブジェクトを復帰する
        if(Scene_Recollection.returnScene === "menu") {
            $gameSystem         = JsonEx.parse(Scene_Recollection.returnGameObjects.system);
            $gameScreen         = JsonEx.parse(Scene_Recollection.returnGameObjects.screen);
            $gameTimer          = JsonEx.parse(Scene_Recollection.returnGameObjects.timer);
            $gameSwitches       = JsonEx.parse(Scene_Recollection.returnGameObjects.switches);
            $gameVariables      = JsonEx.parse(Scene_Recollection.returnGameObjects.variables);
            $gameSelfSwitches   = JsonEx.parse(Scene_Recollection.returnGameObjects.selfSwitches);
            $gameActors         = JsonEx.parse(Scene_Recollection.returnGameObjects.actors);
            $gameParty          = JsonEx.parse(Scene_Recollection.returnGameObjects.party);
            $gameMap            = JsonEx.parse(Scene_Recollection.returnGameObjects.map);
            $gamePlayer         = JsonEx.parse(Scene_Recollection.returnGameObjects.player);
            $gameSystem.replayBgm();
            var exists = false;
            var sLen = SceneManager._stack.length;
            if(sLen > 0 && SceneManager._stack[sLen-1].name === "Scene_Menu") {
                exists = true;
            }

            if(exists) {
                SceneManager.pop();
            } else {
                SceneManager.goto(Scene_Menu);
            }
        } else {
            SceneManager.goto(Scene_Title);
        }
    };


    //-------------------------------------------------------------------------
    // ● 回想orCGモードにおいて、実際の回想orCGを選択した場合のコマンド
    //-------------------------------------------------------------------------
    Scene_Recollection.prototype.commandDoRecMode = function() {
        var target_index = this._rec_list.index() + 1;
        Scene_Recollection.rec_list_index = target_index - 1;

        if (this._rec_list.is_valid_picture(this._rec_list.index() + 1)) {
            // 回想モードの場合
            if (this._mode === "recollection") {
                Scene_Recollection._rngd_recollection_doing = true;

                $gamePlayer.setTransparent(255);
                this.fadeOutAll();

                $gameTemp.reserveCommonEvent(rngd_recollection_mode_settings.rec_cg_set[target_index]["common_event_id"]);
                $gamePlayer.reserveTransfer(rngd_recollection_mode_settings.sandbox_map_id, 0, 0, 0);
                Graphics.frameCount = 0;
                SceneManager.push(Scene_Map);

                // CGモードの場合
            } else if (this._mode === "cg") {
                this._cg_sprites = [];
                this._cg_sprites_index = 0;

                // シーン画像をロードする
                rngd_recollection_mode_settings.rec_cg_set[target_index].pictures.forEach(function (name) {
                    // CGクリックを可能とする
                    var sp = new Sprite_Button();
                    sp.setClickHandler(this.commandDummyOk.bind(this));
                    sp.processTouch = function() {
                        Sprite_Button.prototype.processTouch.call(this);

                    };
                    sp.bitmap = ImageManager.loadPicture(name);
                    // 最初のSprite以外は見えないようにする
                    if (this._cg_sprites.length > 0) {
                        sp.visible = false;
                    }

                    this._cg_sprites.push(sp);
                    this.addChild(sp);

                }, this);

                this.do_exchange_status_window(this._rec_list, this._dummy_window);
                this._dummy_window.visible = false;
            }
        } else {
            this._rec_list.activate();
        }
    };



    //-------------------------------------------------------------------------
    // ● 回想モードの選択肢を作成
    //-------------------------------------------------------------------------
    Window_RecollectionCommand.prototype.makeCommandList = function() {
        Window_Command.prototype.makeCommandList.call(this);
        this.addCommand(rngd_recollection_mode_settings.rec_mode_window.str_select_recollection, "select_recollection");
        this.addCommand(rngd_recollection_mode_settings.rec_mode_window.str_select_cg, "select_cg");
        // 「戻る」に該当する文字列をセットする
        var backTitle = rngd_recollection_mode_settings.rec_mode_window.str_select_back_title;
        if(Scene_Recollection.returnScene === "menu") {
            backTitle = rngd_recollection_mode_settings.rec_mode_window.str_select_back_menu;
        }
        this.addCommand(backTitle, "select_back_title");
    };

    //-------------------------------------------------------------------------
    // ● 全てのセーブデータを走査し、対象のシーンスイッチ情報を取得する
    //-------------------------------------------------------------------------
    Window_RecList.prototype.get_global_variables = function() {
        this._global_variables = {
            "switches": {}
        };
        var maxSaveFiles = DataManager.maxSavefiles();
        for(var i = 1; i <= maxSaveFiles; i++) {
            if(DataManager.loadGameSwitch(i)) {
                var rngdGlobalSwitchObj = JsonEx.parse(DataManager.rngdGlobalSwitch);
                var rec_cg_max = rngd_hash_size(rngd_recollection_mode_settings.rec_cg_set);

                for(var j = 0; j < rec_cg_max; j++) {
                    var cg = rngd_recollection_mode_settings.rec_cg_set[j+1];
                    if(rngdGlobalSwitchObj._data[cg.switch_id]) {
                        this._global_variables["switches"][cg.switch_id] = true;
                    }
                }
            }
        }
    };

    DataManager.createGameObjectSwitch = function() {
    };

    DataManager.extractSaveContentsSwitches = function(contents) {
        DataManager.rngdGlobalSwitch = JsonEx.stringify(contents.switches);

    };

(function() {
//-----------------------------------------------------------------------------
// ◆ 組み込み関数Fix
//-----------------------------------------------------------------------------
    var pluginParams = PluginManager.parameters("RecollectionMode_back_to_menu_and_title_patch");
    Scene_Recollection.displayPosRecoMenu = pluginParams["コマンド追加位置"];
    Scene_Recollection.displayRecoMenu    = pluginParams["「回想」コマンドの名称"];
    rngd_recollection_mode_settings["rec_mode_window"]["str_select_back_menu"] = pluginParams["「戻る」コマンドの名称"];
    //-------------------------------------------------------------------------
    // ● メニューコマンドのFIX。回想モード用のコマンドを追加
    //-------------------------------------------------------------------------
    var _Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {
        _Window_MenuCommand_makeCommandList.call(this);
        this.addRngdRecollectionCommand();

        var recoComandObj = this._list.pop();
        this._list.splice(Scene_Recollection.displayPosRecoMenu, 0, recoComandObj);

    };

    //-------------------------------------------------------------------------
    // ● 回想モード用のコマンドを追加
    //-------------------------------------------------------------------------
    Window_MenuCommand.prototype.addRngdRecollectionCommand = function() {
        this.addCommand(Scene_Recollection.displayRecoMenu, "rngd_reco");
    };

    //-------------------------------------------------------------------------
    // ● 回想モード用コマンドにイベントを設定
    //-------------------------------------------------------------------------
    var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);

        this._commandWindow.setHandler('rngd_reco', this.commandRngdRecollectionMode.bind(this));
    };

    //-------------------------------------------------------------------------
    // ● メニューから回想モードに移動
    //-------------------------------------------------------------------------
    Scene_Menu.prototype.commandRngdRecollectionMode = function() {
        $gameSystem.saveBgm();
        SceneManager.push(Scene_Recollection);
    };

    // セーブデータ共有オプションが指定されている場合のコンテンツ退避及び復帰のFIX
    if(rngd_recollection_mode_settings["share_recollection_switches"]) {
        var _DataManager_makeSaveContents = DataManager.makeSaveContents;
        DataManager.makeSaveContents = function() {
            Scene_Recollection.setRecollectionSwitches();
            var contents = _DataManager_makeSaveContents.call(this);
            return contents;
        };
        var _DataManager_extractSaveContents = DataManager.extractSaveContents;
        DataManager.extractSaveContents = function(contents) {
            _DataManager_extractSaveContents.call(this, contents);
            Scene_Recollection.setRecollectionSwitches();
        };

        DataManager.setupNewGame = function() {
            this.createGameObjects();
            Scene_Recollection.setRecollectionSwitches();
            this.selectSavefileForNewGame();
            $gameParty.setupStartingMembers();
            $gamePlayer.reserveTransfer($dataSystem.startMapId,
                $dataSystem.startX, $dataSystem.startY);
            Graphics.frameCount = 0;
        };
    }

})();
