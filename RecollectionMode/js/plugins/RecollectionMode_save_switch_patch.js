//=============================================================================
// RecollectionMode_save_switch_patch.js
// Copyright (c) 2016 rinne_grid
// This plugin is released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//
// Version
// 1.0.0 2016/12/24 公開
// 1.1.0 2019/02/10 回想モードで利用しているスイッチのみを
//                  セーブ対象とするためのコマンドを追加
// 1.1.1 2019/02/23 回想スイッチ共有に対応
//                  save_only_reco_switchエラー発生時のセーブファイル処理を変更
//=============================================================================
/*:ja
 * @plugindesc セーブデータに、その時点のスイッチ情報を保存することができます。
 *
 * @author rinne_grid
 *
 *
 * @help
 *  プラグインコマンド
 *    RecoModeExt save
 *
 *     イベントでゲームオーバーになった時だけ「敗北CG・シーン」を
 *     回想として追加する必要がある・・・という場合に利用できると思われます。
 *
 *     例・・・1番目のセーブデータでゲームプレイ
 *     ・勝敗でイベント分岐しておく
 *     ・負けた場合：負けた際のCG出現スイッチをONにする
 *     ・プラグインコマンド(RecoModeExt save)を実行する
 *     ・ゲームオーバーの処理を行う
 *     →1番目のセーブデータを改めてロードすると、CG出現スイッチがONの状態で再開できる
 *     （この場合、ゲームオーバー時点のスイッチ情報を元にします。）
 *
 *
 *    RecoModeExt set_save_check_point
 *     コマンド実行時点のスイッチ状態を保存します
 *
 *    RecoModeExt save_only_reco_switch
 *     set_save_check_pointの実行後に呼び出します。
 *     set_save_check_pointを実行した時点のスイッチ情報を元に
 *     RecollectionMode.jsで指定している回想用スイッチのみをセーブします。
 *     【注意事項】
 *     ・セーブデータがまだ1つも存在しない場合、セーブ処理をせずスキップします。
 *
 */

var rngd_$gameTemp      = null;
rngd_$gameSystem        = null;
rngd_$gameScreen        = null;
rngd_$gameTimer         = null;
rngd_$gameMessage       = null;
rngd_$gameVariables     = null;
rngd_$gameSelfSwitches  = null;
rngd_$gameActors        = null;
rngd_$gameParty         = null;
rngd_$gameTroop         = null;
rngd_$gameMap           = null;
rngd_$gamePlayer        = null;

(function() {
    var RNGD_CONST = {};
    RNGD_CONST.RNGD_RECO_PATCH_SAVE_SWITCH_ERR_001_MSG = "RecoModeExt set_save_check_pointコマンドが呼ばれていません。";
    RNGD_CONST.RNGD_RECO_PATCH_SAVE_SWITCH_ERR_001     = "RecollectionMode_save_switch_patchコマンドエラー";
    var parameters = PluginManager.parameters('RecollectionMode_save_switch_patch');
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

    Game_System.prototype.$$rngdGameSwitch = null;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if(command === 'RecoModeExt') {
            switch(args[0]) {
                case 'save':
                    $gameSystem.rngd_recollectionModeExtSave();
                    break;
                case 'set_save_check_point':
                    $gameSystem.rngd_recollectionModeSetSaveCheckPoint();
                    break;
                case 'save_only_reco_switch':
                    var recoSwitchOnly = true;
                    $gameSystem.rngd_recollectionModeExtSave(recoSwitchOnly);
                    // チェックポイント用スイッチをクリアする
                    $gameSystem.$$rngdGameSwitch = null;
                    break;
            }
        }
    };

    //-------------------------------------------------------------------------
    // ● 最後にアクセスしたセーブデータをロードし、スイッチ以外のオブジェクトを取得
    //-------------------------------------------------------------------------
    Game_System.prototype.rngd_recollectionModeExtSave = function(recoSwitchOnly) {
        // 1度ロードして、スイッチ以外のオブジェクトを適用
        // スイッチのみを新オブジェクトとして適用したものを保存
        var result = DataManager.rngd_loadGameExcludeSwitch(DataManager._lastAccessedId);
        if(result) {
            DataManager.rngd_saveGameSwitchOnly(DataManager._lastAccessedId, recoSwitchOnly);
        } else {
            console.warn("RecollectionMode_save_switch_path.js - セーブデータがありません。セーブをスキップします");
        }
    };

    //-------------------------------------------------------------------------
    // ● コマンド実行時点のスイッチ情報を保存する
    //-------------------------------------------------------------------------
    Game_System.prototype.rngd_recollectionModeSetSaveCheckPoint = function() {
        // スイッチのみを新オブジェクトとして適用したものを保存
        $gameSystem.$$rngdGameSwitch = JsonEx.makeDeepCopy($gameSwitches);
    };

    //-------------------------------------------------------------------------
    // ● loadGame拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_loadGameExcludeSwitch = function(savefileId) {
        try {
            return this.rngd_loadGameWithoutRescueExcludeSwitch(savefileId);
        } catch(e) {
            console.error(e);
            return false;
        }
    };

    //-------------------------------------------------------------------------
    // ● loadGameWithoutRescue拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_loadGameWithoutRescueExcludeSwitch = function(savefileId) {
        var globalInfo = this.loadGlobalInfo();
        if(this.isThisGameFile(savefileId)) {
            var json = StorageManager.load(savefileId);
            this.rngd_createGameObjectsExcludeSwitch();
            this.rngd_extractSaveContentsExcludeSwitch(JsonEx.parse(json));
            return true;
        } else {
            return false;
        }
    };

    //-------------------------------------------------------------------------
    // ● createGameObjects拡張：セーブデータのスイッチは利用しない
    //-------------------------------------------------------------------------
    DataManager.rngd_createGameObjectsExcludeSwitch = function() {
        $gameTemp               = new Game_Temp();
        rngd_$gameTemp          = new Game_Temp();
        rngd_$gameSystem        = new Game_System();
        rngd_$gameScreen        = new Game_Screen();
        rngd_$gameTimer         = new Game_Timer();
        rngd_$gameMessage       = new Game_Message();
        //$gameSwitches      = new Game_Switches();
        rngd_$gameVariables     = new Game_Variables();
        rngd_$gameSelfSwitches  = new Game_SelfSwitches();
        rngd_$gameActors        = new Game_Actors();
        rngd_$gameParty         = new Game_Party();
        rngd_$gameTroop         = new Game_Troop();
        rngd_$gameMap           = new Game_Map();
        rngd_$gamePlayer        = new Game_Player();
    };

    //-------------------------------------------------------------------------
    // ● extractSaveContents拡張：セーブデータのスイッチは利用しない
    //-------------------------------------------------------------------------
    DataManager.rngd_extractSaveContentsExcludeSwitch = function(contents) {
        rngd_$gameSystem        = contents.system;
        rngd_$gameScreen        = contents.screen;
        rngd_$gameTimer         = contents.timer;
        //$gameSwitches      = contents.switches;
        rngd_$gameVariables     = contents.variables;
        rngd_$gameSelfSwitches  = contents.selfSwitches;
        rngd_$gameActors        = contents.actors;
        rngd_$gameParty         = contents.party;
        rngd_$gameMap           = contents.map;
        rngd_$gamePlayer        = contents.player;
    };

    //-------------------------------------------------------------------------
    // ● saveGame拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_saveGameSwitchOnly = function(savefileId, recoSwitchOnly) {
        try {
            return this.rngd_saveGameWithoutRescueByLoadDataAndCurrentOne(savefileId, recoSwitchOnly);
        } catch (e) {
            console.error(e);
            try {
                if(e.message !== RNGD_CONST.RNGD_RECO_PATCH_SAVE_SWITCH_ERR_001_MSG) {
                    StorageManager.remove(savefileId);
                }
            } catch (e2) {
            }
            return false;
        }
    };

    //-------------------------------------------------------------------------
    // ● saveGameWithoutRescue拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_saveGameWithoutRescueByLoadDataAndCurrentOne = function(savefileId, recoSwitchOnly) {
        var json = JsonEx.stringify(this.rngd_makeSaveContentsFromTemp(recoSwitchOnly));
        if (json.length >= 200000) {
            console.warn('Save data too big!');
        }
        StorageManager.save(savefileId, json);
        this._lastAccessedId = savefileId;
        var globalInfo = this.loadGlobalInfo() || [];
        globalInfo[savefileId] = this.makeSavefileInfo();
        this.saveGlobalInfo(globalInfo);
        return true;
    };

    //-------------------------------------------------------------------------
    // ● makeSaveContents拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_makeSaveContentsFromTemp = function(recoSwitchOnly) {
        // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
        if(rngd_recollection_mode_settings["share_recollection_switches"]) {
            Scene_Recollection.setRecollectionSwitches();
        }

        var contents = {};
        contents.system       = rngd_$gameSystem;
        contents.screen       = rngd_$gameScreen;
        contents.timer        = rngd_$gameTimer;
        if(recoSwitchOnly !== undefined && recoSwitchOnly !== null && recoSwitchOnly === true) {
            if($gameSystem.$$rngdGameSwitch === null || $gameSystem.$$rngdGameSwitch === undefined) {
                Graphics.printError(RNGD_CONST.RNGD_RECO_PATCH_SAVE_SWITCH_ERR_001, RNGD_CONST.RNGD_RECO_PATCH_SAVE_SWITCH_ERR_001_MSG);
                throw new Error(RNGD_CONST.RNGD_RECO_PATCH_SAVE_SWITCH_ERR_001_MSG);
            }
            var recMaxSize = rngd_hash_size(rngd_recollection_mode_settings.rec_cg_set);
            var targetSwitchObjList = [];
            for(var i = 0; i < recMaxSize; i++) {
                var targetSwitchId = rngd_recollection_mode_settings.rec_cg_set[i+1].switch_id;
                var targetSwitchValue = $gameSwitches.value(targetSwitchId);
                targetSwitchObjList.push({switchId: targetSwitchId, value: targetSwitchValue});
            }
            targetSwitchObjList.forEach(function(switchObj) {
                $gameSystem.$$rngdGameSwitch._data[switchObj.switchId] = switchObj.value;
            });
            contents.switches = $gameSystem.$$rngdGameSwitch;

        } else {
            contents.switches     = $gameSwitches;
        }
        contents.variables    = rngd_$gameVariables;
        contents.selfSwitches = rngd_$gameSelfSwitches;
        contents.actors       = rngd_$gameActors;
        contents.party        = rngd_$gameParty;
        contents.map          = rngd_$gameMap;
        contents.player       = rngd_$gamePlayer;
        return contents;
    };

})();