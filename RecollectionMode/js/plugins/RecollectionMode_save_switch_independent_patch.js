//=============================================================================
// RecollectionMode_save_switch_independent_patch.js
// Copyright (c) 2019 rinne_grid
// This plugin is released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//
// Version
// 1.0.0 2019/03/07 公開
//=============================================================================
/*:ja
 * @plugindesc 回想モードに関係するスイッチ情報を保存し、セーブ・ロード時に
 *             反映するプラグインパッチです
 *
 * @author rinne_grid
 *
 * @help
 * 【重要】
 *   - 必ず既存のセーブデータのバックアップを取得してください。
 *   - RecollectionMode_save_switch_path.jsと共存できません。
 *   - RecollectionMode.jsのスイッチ共有オプション(share_recollection_switches)を
 *     有効(true)にして利用することを強くオススメします
 *   - スイッチ共有オプションを有効にしない場合、別途セーブプラグイン等を導入いただき
 *      ゲーム開始時にセーブデータが作成されるようにしてください。
 *      →これを行わないと、設定ファイルに保存されたセーブ番号と、
 *        プレイ中のセーブデータ番号が一致しなくなる可能性があります

 *        [例]
 *        セーブXで回想aを開放した　セーブYで回想aを開放していない
 *        →正しい状態：
 *            設定ファイルのセーブXでは、回想aがON
 *            設定ファイルのセーブYでは、回想aがOFF
 *        →一致しない状態：
 *            設定ファイルのセーブXでは、回想aがOFF
 *            設定ファイルのセーブYでは、回想aがON
 *            設定ファイルのセーブZでは、回想aがON　このような状態が発生してしまう可能性があります
 *
 * 【プラグインコマンド】
 *    RecoModeExt save
 *     回想モードのスイッチに関する情報を設定ファイル(※)に保存します。
 *
 *     ※設定ファイル
 *       通常実行の場合     : saveフォルダ内のrngd_recomode_switch.rpgsaveファイル
 *       ブラウザ実行の場合 : Local Storage「RPG rngd_recomode_switch」キー
 *
 * 【仕様】
 *   - プラグインコマンド「RecoModeExt save」で回想モードのスイッチに関する情報のみを
 *     save/rngd_recomode_switch.rpgsaveファイル（以下設定ファイル）に記録します
 *     ブラウザモードで実行する場合、Webストレージキー「RPG rngd_recomode_switch」に記録します
 *   - 通常セーブ時においてもRecoModeExt saveと同様にファイルに回想スイッチ情報が記録されます
 *   - ロード時は設定ファイルからゲームスイッチにON/OFFを反映します
 *     設定ファイルが存在しない場合はゲームのスイッチ情報を正とするため、反映しません
 *   - 回想の状態を保存するため、設定ファイルで持っているスイッチ情報がOFFの場合のみ
 *     ゲーム上の回想スイッチ情報を記録（ONに）するという制限があります
 *
 *     [スイッチ情報が反映されるケース]
 *     - 1. 設定ファイルに記録された回想スイッチX、Y、ZがOFF もしくは設定ファイルが存在しない
 *     - 2. ゲーム上で回想スイッチXがONになった
 *     - 3. RecoModeExt saveを実行
 *     - → 設定ファイルに回想スイッチに関する情報が記録される（スイッチXがON、スイッチY、ZがOFF）
 *
 *     [スイッチ情報が反映されないケース]
 *     - 1. 設定ファイルに記録された回想スイッチXがON、Y、ZがOFF
 *     - 2. ゲーム上で回想スイッチXをOFFにした
 *     - 3. RecoModeExt saveを実行
 *     - → 設定ファイルに回想スイッチに関する情報が記録される
 *       →しかし、スイッチXはONの状態のままとなります。
 *
 *   - 回想の情報をリセットしたい場合は、設定ファイルを削除する必要があります。
 *     すべてのセーブのスイッチ情報を一つのファイルで管理しているため、
 *     設定ファイルを削除すると、全セーブデータの回想表示に関する情報が失われます
 *
 */


(function() {

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if(command === 'RecoModeExt') {
            switch(args[0]) {
                case 'save':
                    $gameSystem.rngd_recollectionModeExtSave();
                    break;
            }
        }
    };

    //-------------------------------------------------------------------------
    // ● 回想モードのスイッチのみセーブする
    //-------------------------------------------------------------------------
    Game_System.prototype.rngd_recollectionModeExtSave = function() {
        DataManager.rngd_saveGameSwitchOnly(DataManager._lastAccessedId);
    };

    //-------------------------------------------------------------------------
    // ● 設定ファイル用のキーを取得する
    //-------------------------------------------------------------------------
    DataManager.getRngdRecoPatchFileKey = function(saveFileId) {
        var fileKey = saveFileId;
        if(rngd_recollection_mode_settings["share_recollection_switches"]) {
            fileKey = "common";
        }
        return fileKey;
    };

    //-------------------------------------------------------------------------
    // ● loadGameWithoutRescue拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_reco_patch_loadGameWithoutRescue = function(savefileId) {
        var json = StorageManager.rngd_reco_patch_load();
        var rngd_reco_patch_file_key = this.getRngdRecoPatchFileKey(savefileId);

        if(json !== undefined && json !== "") {
            var rngd_reco_patch_switch_obj = JsonEx.parse(json);
            rngd_reco_patch_switch_obj[rngd_reco_patch_file_key].forEach(function(obj) {
                $gameSwitches.setValue(obj.switchId, obj.value);
            });
        }
        return true;
    };


    //-------------------------------------------------------------------------
    // ● saveGame拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_saveGameSwitchOnly = function(savefileId) {
        try {
            return this.rngd_saveGameWithoutRescueByLoadDataAndCurrentOne(savefileId);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    //-------------------------------------------------------------------------
    // ● saveGameWithoutRescue拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_saveGameWithoutRescueByLoadDataAndCurrentOne = function(savefileId) {
        var json = JsonEx.stringify(this.rngd_reco_patch_makeSaveContents(savefileId));
        if (json.length >= 200000) {
            console.warn('Save data too big!');
        }
        StorageManager.rngd_reco_patch_save(json);
        return true;
    };


    //-------------------------------------------------------------------------
    // ● makeSaveContents拡張
    //-------------------------------------------------------------------------
    DataManager.rngd_reco_patch_makeSaveContents = function(savefileId) {
        // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
        var rngd_reco_patch_file_key = this.getRngdRecoPatchFileKey(savefileId);

        var contents = {};
        try {
            var loadObj = StorageManager.rngd_reco_patch_load();
            contents = JsonEx.parse(loadObj);

            var recMaxSize = rngd_hash_size(rngd_recollection_mode_settings.rec_cg_set);
            for(var i = 0; i < recMaxSize; i++) {
                var targetSwitchId = rngd_recollection_mode_settings.rec_cg_set[i+1].switch_id;
                var targetSwitchValue = $gameSwitches.value(targetSwitchId);

                // ファイルに記録したスイッチデータがfalseの場合のみ、ゲームデータを反映する
                if(contents[rngd_reco_patch_file_key] !== undefined && contents[rngd_reco_patch_file_key][i].value === false) {
                    contents[rngd_reco_patch_file_key][i].value = targetSwitchValue;
                }
            }
        } catch(e) {
            // console.warn("既存のスイッチセーブデータが存在しないためゲームスイッチ情報を利用");
            contents[rngd_reco_patch_file_key] = [];
            var recMaxSize = rngd_hash_size(rngd_recollection_mode_settings.rec_cg_set);
            var targetSwitchObjList = [];
            for(var i = 0; i < recMaxSize; i++) {
                var targetSwitchId = rngd_recollection_mode_settings.rec_cg_set[i+1].switch_id;
                var targetSwitchValue = $gameSwitches.value(targetSwitchId);
                targetSwitchObjList.push({switchId: targetSwitchId, value: targetSwitchValue});

            }
            contents[rngd_reco_patch_file_key] = targetSwitchObjList;
        }

        return contents;
    };

    //-------------------------------------------------------------------------
    // ● ロード時にスイッチ設定ファイルからスイッチ情報を読み込む
    //-------------------------------------------------------------------------
    DataManager.loadGameWithoutRescue = function(savefileId) {
        var globalInfo = this.loadGlobalInfo();
        if (this.isThisGameFile(savefileId)) {
            var json = StorageManager.load(savefileId);
            this.createGameObjects();
            this.extractSaveContents(JsonEx.parse(json));

            try {
                // パッチ用のファイルから回想スイッチ情報をロードする
                this.rngd_reco_patch_loadGameWithoutRescue(savefileId);
            } catch(e) {
                console.log(e);
            }

            this._lastAccessedId = savefileId;
            return true;
        } else {
            return false;
        }
    };

    //-------------------------------------------------------------------------
    // ● セーブ時にスイッチ設定ファイルにスイッチ情報を書き込む
    //-------------------------------------------------------------------------
    DataManager.saveGameWithoutRescue = function(savefileId) {
        var json = JsonEx.stringify(this.makeSaveContents());
        if (json.length >= 200000) {
            console.warn('Save data too big!');
        }
        StorageManager.save(savefileId, json);

        try {
            // パッチ用のファイルに回想スイッチ情報をセーブする
            this.rngd_saveGameSwitchOnly(savefileId);
        } catch(e) {
            console.log(e);
        }

        this._lastAccessedId = savefileId;
        var globalInfo = this.loadGlobalInfo() || [];
        globalInfo[savefileId] = this.makeSavefileInfo();
        this.saveGlobalInfo(globalInfo);
        return true;
    };

    //-------------------------------------------------------------------------
    // ● ローカルセーブ・Webストレージセーブの判断
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_save = function(json) {
        if (this.isLocalMode()) {
            this.rngd_reco_patch_saveToLocalFile(json);
        } else {
            this.rngd_reco_patch_saveToWebStorage(json);
        }
    };

    //-------------------------------------------------------------------------
    // ● ローカルからのロード・Webストレージからのロードの判断
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_load = function() {
        if (this.isLocalMode()) {
            return this.rngd_reco_patch_loadFromLocalFile();
        } else {
            return this.rngd_reco_patch_loadFromWebStorage();
        }
    };

    //-------------------------------------------------------------------------
    // ● ローカルセーブファイル名を作成する
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_localFilePath = function() {
        var name = "rngd_recomode_switch.rpgsave";
        return this.localFileDirectoryPath() + name;
    };

    //-------------------------------------------------------------------------
    // ● Webストレージキー名を作成する
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_webStorageKey = function() {
        return 'RPG rngd_recomode_switch';
    };

    //-------------------------------------------------------------------------
    // ● ローカルファイルにセーブする
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_saveToLocalFile = function(json) {
        var data = LZString.compressToBase64(json);
        var fs = require('fs');
        var dirPath = this.localFileDirectoryPath();
        var filePath = this.rngd_reco_patch_localFilePath();
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        fs.writeFileSync(filePath, data);
    };

    //-------------------------------------------------------------------------
    // ● ローカルファイルからロードする
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_loadFromLocalFile = function() {
        var data = null;
        var fs = require('fs');
        var filePath = this.rngd_reco_patch_localFilePath();
        if (fs.existsSync(filePath)) {
            data = fs.readFileSync(filePath, { encoding: 'utf8' });
        }
        return LZString.decompressFromBase64(data);
    };

    //-------------------------------------------------------------------------
    // ● Webストレージにセーブする
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_saveToWebStorage = function(json) {
        var key = this.rngd_reco_patch_webStorageKey();
        var data = LZString.compressToBase64(json);
        localStorage.setItem(key, data);
    };

    //-------------------------------------------------------------------------
    // ● Webストレージからロードする
    //-------------------------------------------------------------------------
    StorageManager.rngd_reco_patch_loadFromWebStorage = function() {
        var key = this.rngd_reco_patch_webStorageKey();
        var data = localStorage.getItem(key);
        return LZString.decompressFromBase64(data);
    };

    //-------------------------------------------------------------------------
    // ● セーブデータではなく、スイッチ情報ファイルを参照する
    //-------------------------------------------------------------------------
    Window_RecList.prototype.get_global_variables = function() {
        this._global_variables = {
            "switches": {}
        };
        var maxSaveFiles = DataManager.maxSavefiles();
        var recoPatchDataStr = StorageManager.rngd_reco_patch_load();
        var recoPatchDataObj = JsonEx.parse(recoPatchDataStr);

        // keyが common か 1,2,3,4,...セーブデータ最大
        var rngdRecoPatchFileKey = DataManager.getRngdRecoPatchFileKey("");
        if(rngdRecoPatchFileKey === "common") {
            this.rngd_reco_patch_set_file_switch_data(recoPatchDataObj, rngdRecoPatchFileKey);
        } else {
            for(var saveIdx = 1; saveIdx <= maxSaveFiles; saveIdx++) {
                this.rngd_reco_patch_set_file_switch_data(recoPatchDataObj, saveIdx);
            }
        }

    };

    //-------------------------------------------------------------------------
    // ● スイッチ設定ファイルのうち、対象のセーブデータもしくは共有セーブで
    //    スイッチがONの場合、回想モードのスイッチを開放する
    //-------------------------------------------------------------------------
    Window_RecList.prototype.rngd_reco_patch_set_file_switch_data = function(targetObj, key) {
        if(targetObj[key] !== undefined && targetObj[key].length > 0) {
            for(var recoSwIdx = 0; recoSwIdx < targetObj[key].length; recoSwIdx++) {
                if(targetObj[key][recoSwIdx].value) {
                    this._global_variables["switches"][ targetObj[key][recoSwIdx].switchId ] = true;
                }
            }
        }
    };
})();
