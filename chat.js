// データベースと接続する
var messagesRef = new Firebase('データベース接続先');

//firebase初期化
var firebaseConfig = {
    apiKey: 'apiKey',
    projectId: 'projectId',
    storageBucket: 'storageBucket',
}
firebase.initializeApp(firebaseConfig);

//HTMLの要素をJSに
var messageField = $('#messageInput');
var nameField = $('#nameInput');
var messageList = $('#messages');

//テキストボックスの背景色を変えるために設定
var namei, messagei;
window.onload = function(){namei = document.getElementById("nameInput"); 
                           messagei = document.getElementById("messageInput");
};

//最初の画像表示の待ち時間
var loadtime = 1500;

// ENTERキーを押した時に発動
messageField.keypress(function (e) {
    if (e.keyCode == 13) {
        //テキストボックスに入力された情報
        var username = nameField.val();
        var message = messageField.val();

        //ユーザー名・メッセージが空白等ではないかチェック
        var flg1 = datacheck(username);
        if(flg1 == 1){
            namei.style.background = "#ffdce4";     //ユーザー名のテキストボックスの背景色を変更
        }else{
            namei.style.background = "";
        }
        var flg2 = datacheck(message);
        if(flg2 == 1){
            messagei.style.background = "#e1eefe";  //メッセージのテキストボックスの背景色を変更
        }else{
            messagei.style.background = "";
        }

        //エスケープ処理
        username = escape(username);
        message = escape(message);

        //ユーザー名・メッセージが入力されており、チェックに引っかからなかったら
        if(flg1 == 0 & flg2 == 0){
            //送信時刻をセット
            var time = settime(); 

            //データベースに保存する
            messagesRef.push({name:username, text:message,time:time});
            messageField.val('');
        }
    }
});

// データベースにデータが追加されたときに発動
messagesRef.limitToLast(10).on('child_added', function (snapshot) {
    //取得したデータ
    var data = snapshot.val();
    var username = data.name;
    var message = data.text;
    var time = data.time;
    var url = data.url;

    //データ（メッセージか画像か）の判断結果を格納
    var imgflg = 0;

    //取得したデータの名前が自分の名前なら右側に吹き出しを出す
    if ( username == nameField.val() ) {
        //取得したデータ（メッセージまたは画像）によって表示を行う
        if(typeof message != 'undefined'){
            //メッセージのとき
            var messageElement = $("<il><p class='sender_name me'>" + username + "</p><p class='right_balloon'>" + message + "</p><p class='right_time'>" + time + "</p><p class='clear_balloon'></p></il>");
        }else{
            //画像のとき
            var messageElement = $("<il><p class='sender_name me'>" + username + "</p><p class='right_balloon'><img class='img' width='400px' src='" + url + "'/></p><p class='right_time'>" + time + "</p><p class='clear_balloon'></p></il>");
            imgflg = 1;
        }
    } else {    //左側に出す
        //取得したデータ（メッセージまたは画像）によって表示を行う
        if(typeof message != 'undefined'){
            //メッセージのとき
            var messageElement = $("<il><p class='sender_name'>" + username + "</p><p class='left_balloon'>" + message + "</p><p class='left_time'>" + time + "</p><p class='clear_balloon'></p></il>");
        }else{
            //画像のとき
            var messageElement = $("<il><p class='sender_name'>" + username + "</p><p class='left_balloon'><img class='img' width='400px' src='" + url + "'/></p><p class='left_time'>" + time + "</p><p class='clear_balloon'></p></il>");
            imgflg = 1;
        }
    }

    //画像とメッセージで表示するまでの時間を変える
    if(imgflg != 1){
        //HTMLに取得したデータを追加する
        messageList.append(messageElement);
        //一番下にスクロールする
        document.getElementById('messages').scrollIntoView(false);
    }else{  //画像のとき
        $.when(
            //HTMLに取得したデータを追加する
            messageList.append(messageElement)
        ).done(function(){
            setTimeout(function() {
                //一番下にスクロールする
                document.getElementById('messages').scrollIntoView(false);
            }, loadtime);
        });
    }
});


//画像送信ボタンが押されたとき
var form = document.querySelector('form');
form.addEventListener('submit', function (e) {
    //テキストボックスに入力された名前を取得
    var username = nameField.val();
    //ユーザー名が空白等ではないかチェック
    var flg1 = datacheck(username);
    if(flg1 == 1){
        namei.style.background = "#ffdce4";
    }else{
        namei.style.background = "";
    }
    //エスケープ処理
    username = escape(username);

    var imgs = form.querySelector('input');

    //ユーザー名が入力されており、チェックに引っかからなかった、かつ、ファイルが1つ以上選択されていること
    if(flg1 == 0 & 0 < imgs.files.length){
        //送信時刻をセット
        var time = settime();
        //画像をアップロードし終わった後、（複数ある場合はまとめて）データベースに登録するための配列
        var pushdata = [];

        e.preventDefault();
        var uploads = [];
        for (var file of imgs.files) {
        //選択したファイルのファイル名を使うが、場合によってはかぶるので注意
        var storageRef = firebase.storage().ref('form-uploaded/' + file.name);
        //画像をアップロード
        uploads.push(storageRef.put(file));  
        //画像のアクセス先を設定
        var url = 'https://storage.cloud.google.com/chat-c6032.appspot.com/form-uploaded/' + file.name;
        //配列pushdataに連想配列を格納する
        pushdata.push( {name:username, time:time, url:url} );
        //console.log(pushdata);    //配列の内容確認用
        }
          //すべての画像のアップロード完了を待つ
          Promise.all(uploads).then(function () {
            console.log('アップロード完了');
            loadtime = loadtime + imgs.files.length * 50;
            //画像のファイル数、データベースに保存する
            for(i = 0; i < imgs.files.length; i++){
                //データベースに保存する
                messagesRef.push({name:pushdata[i].name,time:pushdata[i].time,url:pushdata[i].url}); 
            }

            //値を再設定　（データベースに登録された後、即データベースにデータが登録されたときの処理が実行され、それが終わった後に実行される）
            loadtime = 950;
            //送信後ファイル選択をクリアする
            imgs.value = "";
          });
    }
});

//ユーザー名・メッセージが空白等ではないかチェック
function datacheck(data){
    if(data == '' || data.slice(0, 1) == ' ' || data.slice(0, 1) == '　'){
        flg = 1;
    }else{
        flg = 0;
    } 
    return flg;
}

//エスケープ処理
function escape(data){
    data = data.replace(/&/g, '&amp;');
    data = data.replace(/>/g, '&gt;');
    data = data.replace(/</g, '&lt;');
    data = data.replace(/"/g, '&quot;');
    data = data.replace(/'/g, '&#x27;');
    data = data.replace(/`/g, '&#x60;');
    return data;
}

//送信時刻をセット
function settime(){
    var now = new Date();
    var time = now.getFullYear() + "/" +
               (now.getMonth() + 1)  + "/" + 
               now.getDate() + " " + 
               //now.getHours() + ":" + と同じ↓　1桁の場合2桁目を0埋め
               now.getHours().toString().padStart(2, '0') + ":" + 
               //now.getMinutes(); と同じ↓　1桁の場合2桁目を0埋め
               now.getMinutes().toString().padStart(2, '0');
    return time;
}