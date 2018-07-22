//===============================================================================================================
// RecollectionMode_back_to_self_menu_and_title_patch.js
// Copyright (c) 2018 rinne_grid
// This plugin is released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//
// Version
// 1.0.0 2018/06/23 公開
// 1.0.1 2018/07/22 Scene_Mapからの直接呼び出しに対応
//       * 戻り先シーンを特定するため、復帰用オブジェクトの保存タイミングを変更
//       * 回想モードの開始時・終了時に特定のスイッチをOFF/ONするためのパラメータ・処理を追加
//===============================================================================================================

/*:ja
 * @plugindesc 任意の自作メニューシーンから回想モードを呼び出せるようにします
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
 * @param 回想コマンドを表示する条件スイッチID
 * @desc このスイッチがONの場合に回想コマンドをメニューに追加します。0の時は常に表示されます。
 * @type switch
 * @default 0
 *
 * @param 自作メニューのシーンクラス名（Scene_XXXX）
 * @desc 自作メニューのシーンクラスを指定します。
 * @type string
 * @default Scene_Menu
 *
 * @param 開始時にOFFにするスイッチID
 * @desc 回想モードを呼び出す時にOFFにするスイッチIDを指定します
 * @type switch
 * @default 15
 *
 * @param 終了時にONにするスイッチID
 * @desc 回想モード終了時にONにするスイッチIDを指定します
 * @type switch
 * @default 15
 *
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 */
"use strict";
    Scene_Recollection.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createWindowLayer();
        this.createCommandWindow();

        var sceneStackLen = SceneManager._stack.length;
        // 1つ前のsceneがselfMenuClassNameの場合、戻り先をselfMenuClassNameとする
        if(SceneManager._stack[sceneStackLen-1].name === Scene_Recollection.selfMenuClassName) {
            Scene_Recollection.returnScene = "menu";

        // 1つ前のsceneがScene_Titleの場合、戻り先は通常どおりタイトルとする
        } else if(SceneManager._stack[sceneStackLen-1].name === "Scene_Title") {
            Scene_Recollection.returnScene = "title";
        }
        // 回想開始時に対象のスイッチをOFFにする
        this.doToggleSwitchIdForStartEnd(Scene_Recollection.switchIdStartOff, false);
        // 画面効果をクリア
        $gameScreen.clear();
    };
    //-------------------------------------------------------------------------
    // ● スイッチ操作
    //-------------------------------------------------------------------------
    Scene_Recollection.prototype.doToggleSwitchIdForStartEnd = function(switchId, value) {
        if(switchId > 0 || switchId !== undefined) {
            $gameSwitches.setValue(switchId, value);
        }
    };

    //-------------------------------------------------------------------------
    // ● 「戻る」を選択した際のコマンド
    //-------------------------------------------------------------------------
    Scene_Recollection.prototype.commandBackTitle = function() {
        Scene_Recollection.rec_list_index = 0;
        // メニューに戻る場合、保存したゲームオブジェクトを復帰する
        if(Scene_Recollection.returnScene === "menu") {
            //メニューから遷移したにも関わらず、復帰オブジェクトが存在しない場合はタイトルに遷移する
            // returnGameObjectsが存在しない
            if(!Scene_Recollection.hasOwnProperty("returnGameObjects") ||
                // returnGameObjectsは定義されているが、systemがない
                ( Scene_Recollection.hasOwnProperty("returnGameObjects") && Scene_Recollection.returnGameObjects === undefined )
            ) {
                // 回想終了時に対象のスイッチをONにする
                this.doToggleSwitchIdForStartEnd(Scene_Recollection.switchIdEndOn, true);
                SceneManager.goto(Scene_Title);
            } else {
                var _system         = Scene_Recollection.returnGameObjects.system;
                var _screen         = Scene_Recollection.returnGameObjects.screen;
                var _timer          = Scene_Recollection.returnGameObjects.timer;
                var _switches       = Scene_Recollection.returnGameObjects.switches;
                var _variables      = Scene_Recollection.returnGameObjects.variables;
                var _selfSwitches   = Scene_Recollection.returnGameObjects.selfSwitches;
                var _actors         = Scene_Recollection.returnGameObjects.actors;
                var _party          = Scene_Recollection.returnGameObjects.party;
                var _map            = Scene_Recollection.returnGameObjects.map;
                var _player         = Scene_Recollection.returnGameObjects.player;

                $gameSystem         = _system;
                $gameScreen         = _screen;
                $gameTimer          = _timer;
                $gameSwitches       = _switches;
                $gameVariables      = _variables;
                $gameSelfSwitches   = _selfSwitches;
                $gameActors         = _actors;
                $gameParty          = _party;

                // $gameMapに関しては、回想前に保存したマップへの遷移で実現する
                // $gameMap            = _map;

                $gamePlayer         = _player;
                $gameSystem.replayBgm();
                AudioManager.replayBgs(Scene_Recollection.saveBgsObject);
                // 方向の復帰
                $gamePlayer.direction = _player.direction;

                // 回想前のマップ情報を復帰する
                $gameMap._mapId             = _map._mapId;
                $gameMap._tilesetId         = _map._tilesetId;
                $gameMap._events            = _map._events;
                $gameMap._commonEvents      = _map._commonEvents;
                $gameMap._vehicles          = _map._vehicles;
                $gameMap._displayX          = _map._displayX;
                $gameMap._displayY          = _map._displayY;
                $gameMap._nameDisplay       = _map._nameDisplay;
                $gameMap._scrollDirection   = _map._scrollDirection;
                $gameMap._scrollRest        = _map._scrollRest;
                $gameMap._scrollSpeed       = _map._scrollSpeed;
                $gameMap._parallaxName      = _map._parallaxName;
                $gameMap._parallaxZero      = _map._parallaxZero;
                $gameMap._parallaxLoopX     = _map._parallaxLoopX;
                $gameMap._parallaxLoopY     = _map._parallaxLoopY;
                $gameMap._parallaxSx        = _map._parallaxSx;
                $gameMap._parallaxSy        = _map._parallaxSy;
                $gameMap._parallaxX         = _map._parallaxX;
                $gameMap._parallaxY         = _map._parallaxY;
                $gameMap._battleback1Name   = _map._battleback1Name;
                $gameMap._battleback2Name   = _map._battleback2Name;

                //$gameMap.setup(_map.mapId);
                //$gamePlayer.reserveTransfer(_map.mapId(), _player.x, _player.y);
                Scene_Recollection["showed_the_reco"] = undefined;
                var exists = false;
                var sLen = SceneManager._stack.length;
                if(sLen > 0 && SceneManager._stack[sLen-1].name === Scene_Recollection.selfMenuClassName) {
                    exists = true;
                }
                if(Scene_Recollection.hasOwnProperty("returnGameObjects")) {
                    Scene_Recollection.returnGameObjects = undefined;
                }
                SceneManager._backgroundBitmap = Scene_Recollection.menuBackgroundBitmap;
                if(exists) {
                    // 回想終了時に対象のスイッチをONにする
                    this.doToggleSwitchIdForStartEnd(Scene_Recollection.switchIdEndOn, true);
                    SceneManager.pop();
                } else {
                    // 回想終了時に対象のスイッチをONにする
                    this.doToggleSwitchIdForStartEnd(Scene_Recollection.switchIdEndOn, true);
                    SceneManager.goto( eval(Scene_Recollection.selfMenuClassName) );
                }
            }


        } else {
            // 回想終了時に対象のスイッチをONにする
            this.doToggleSwitchIdForStartEnd(Scene_Recollection.switchIdEndOn, true);
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
                Scene_Recollection["showed_the_reco"] = "showed";
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
    // ● 回想メニュー作成処理
    //-------------------------------------------------------------------------
    Scene_Recollection.prototype.createCommandWindow = function() {

        if(Scene_Recollection.reload_rec_list) {
            // 回想モード選択ウィンドウ
            this._rec_window = new Window_RecollectionCommand();
            this._rec_window.setHandler('select_recollection', this.commandShowRecollection.bind(this));
            this._rec_window.setHandler('select_cg', this.commandShowCg.bind(this));
            this._rec_window.setHandler('select_back_title', this.commandBackTitle.bind(this));
            this._rec_window.setHandler('cancel', this.commandBackTitle.bind(this));

            // リロードの場合：選択ウィンドウを非表示にする
            this._rec_window.visible = false;
            this._rec_window.deactivate();
            this.addWindow(this._rec_window);

            // 回想リスト
            this._rec_list = new Window_RecList(0, 0, Graphics.width, Graphics.height);

            // リロードの場合：回想リストを表示にする
            this._rec_list.visible = true;
            this._rec_list.setHandler('ok', this.commandDoRecMode.bind(this));
            this._rec_list.setHandler('cancel', this.commandBackSelectMode.bind(this));
            this._mode = "recollection";
            this._rec_list.activate();
            this._rec_list.select(Scene_Recollection.rec_list_index);

            this.addWindow(this._rec_list);

            // CG参照用ダミーコマンド
            this._dummy_window = new Window_Command(0, 0);
            this._dummy_window.deactivate();
            this._dummy_window.visible = false;
            this._dummy_window.setHandler('ok', this.commandDummyOk.bind(this));
            this._dummy_window.setHandler('cancel', this.commandDummyCancel.bind(this));
            this._dummy_window.addCommand('next', 'ok');
            this.addWindow(this._dummy_window);

            Scene_Recollection.reload_rec_list = false;

        } else {
            // 回想モード選択ウィンドウ
            this._rec_window = new Window_RecollectionCommand();
            this._rec_window.setHandler('select_recollection', this.commandShowRecollection.bind(this));
            this._rec_window.setHandler('select_cg', this.commandShowCg.bind(this));
            this._rec_window.setHandler('select_back_title', this.commandBackTitle.bind(this));
            this._rec_window.setHandler('cancel', this.commandBackTitle.bind(this));
            this.addWindow(this._rec_window);

            // 回想リスト
            this._rec_list = new Window_RecList(0, 0, Graphics.width, Graphics.height);
            this._rec_list.visible = false;
            this._rec_list.setHandler('ok', this.commandDoRecMode.bind(this));
            this._rec_list.setHandler('cancel', this.commandBackSelectMode.bind(this));
            this._rec_list.select(Scene_Recollection.rec_list_index);
            this.addWindow(this._rec_list);

            // CG参照用ダミーコマンド
            this._dummy_window = new Window_Command(0, 0);
            this._dummy_window.deactivate();
            this._dummy_window.playOkSound = function(){}; // CGﾓｰﾄﾞの場合、OK音を鳴らさない
            this._dummy_window.visible = false;
            this._dummy_window.setHandler('ok', this.commandDummyOk.bind(this));
            this._dummy_window.setHandler('cancel', this.commandDummyCancel.bind(this));
            this._dummy_window.addCommand('next', 'ok');
            this.addWindow(this._dummy_window);
        }

    };

    //-------------------------------------------------------------------------
    // ● 回想コマンドの表示判断
    //-------------------------------------------------------------------------
    Scene_Recollection.isDisplayRecoMenu = function() {
        // displayRecoSwitchが0 または displayRecoSwitchが0でなく、対象のスイッチIDがtrue(ON)の場合はtrueを返す
        return (Scene_Recollection.displayRecoSwitch === "0" ||
            (
            Scene_Recollection.displayRecoSwitch !== "0" &&
            $gameSwitches.value(Scene_Recollection.displayRecoSwitch)
            )
        );
    };

    //-------------------------------------------------------------------------
    // ● 回想開始用ヘルパー関数
    //-------------------------------------------------------------------------
    Scene_Recollection.startRecollection = function() {
        $gameSystem.saveBgm();
        Scene_Recollection.saveBgsObject = AudioManager.saveBgs();
        AudioManager.stopBgs();

                Scene_Recollection.returnGameObjects = {
                    system      : JsonEx.makeDeepCopy($gameSystem),
                    screen      : JsonEx.makeDeepCopy($gameScreen),
                    timer       : JsonEx.makeDeepCopy($gameTimer),
                    switches    : JsonEx.makeDeepCopy($gameSwitches),
                    variables   : JsonEx.makeDeepCopy($gameVariables),
                    selfSwitches: JsonEx.makeDeepCopy($gameSelfSwitches),
                    actors      : JsonEx.makeDeepCopy($gameActors),
                    party       : JsonEx.makeDeepCopy($gameParty),
                    map         : JsonEx.makeDeepCopy($gameMap),
                    player      : JsonEx.makeDeepCopy($gamePlayer)
                };

        SceneManager.push(Scene_Recollection);
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
    var pluginParams = PluginManager.parameters("RecollectionMode_back_to_self_menu_and_title_patch");
    Scene_Recollection.displayPosRecoMenu = pluginParams["コマンド追加位置"];
    Scene_Recollection.displayRecoMenu    = pluginParams["「回想」コマンドの名称"];
    Scene_Recollection.displayRecoSwitch  = pluginParams["回想コマンドを表示する条件スイッチID"];
    Scene_Recollection.selfMenuClassName  = pluginParams["自作メニューのシーンクラス名（Scene_XXXX）"];
    Scene_Recollection.switchIdStartOff   = pluginParams["開始時にOFFにするスイッチID"];
    Scene_Recollection.switchIdEndOn      = pluginParams["終了時にONにするスイッチID"];
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
        if(Scene_Recollection.isDisplayRecoMenu()) {
            this.addCommand(Scene_Recollection.displayRecoMenu, "rngd_reco");
        }
    };

    //-------------------------------------------------------------------------
    // ● メニュー背景のビットマップを保存する
    //-------------------------------------------------------------------------
    var _Scene_MenuBase_createBackground = Scene_MenuBase.prototype.createBackground;
    Scene_MenuBase.prototype.createBackground = function() {
        _Scene_MenuBase_createBackground.call(this);
        Scene_Recollection.menuBackgroundBitmap = this._backgroundSprite.bitmap;
    };

    //-------------------------------------------------------------------------
    // ● 回想モード用コマンドにイベントを設定
    //-------------------------------------------------------------------------
    var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        if(Scene_Recollection.isDisplayRecoMenu()) {
            this._commandWindow.setHandler('rngd_reco', this.commandRngdRecollectionMode.bind(this));
        }
    };

    //-------------------------------------------------------------------------
    // ● メニューから回想モードに移動
    //-------------------------------------------------------------------------
    Scene_Menu.prototype.commandRngdRecollectionMode = function() {
        // ヘルパー関数追加
        Scene_Recollection.startRecollection();
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