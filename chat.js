// データベースと接続する
var messagesRef = new Firebase('データベース接続先');

var messageField = $('#messageInput');
var nameField = $('#nameInput');
var messageList = $('#messages');

var namei
var messagei
window.onload = function(){namei = document.getElementById("nameInput"); 
                           messagei = document.getElementById("messageInput");};

// ENTERキーを押した時に発動する
messageField.keypress(function (e) {
    if (e.keyCode == 13) {
        //フォームに入力された情報
        var username = nameField.val();
        var message = messageField.val();
        var flg1 = 0;
        var flg2 = 0;

        if(username == '' || username.slice(0, 1) == ' ' || username.slice(0, 1) == '　'){
            namei.style.background = "#ffdce4";
            flg1 = 1;
        }else{
            namei.style.background = "";
            flg1 = 0;
        }        
        if(message == '' || message.slice(0, 1) == ' ' || message.slice(0, 1) == '　'){
            messagei.style.background = "#e1eefe";
            flg2 = 1;
        }else{
            messagei.style.background = "";
            flg2 = 0;
        }
        if(flg1 == 0 & flg2 == 0){
            var now = new Date();
            var time = now.getFullYear() + "/" +
                       (now.getMonth() + 1)  + "/" + 
                       now.getDate() + " " + 
                       //now.getHours() + ":" + 
                       now.getHours().toString().padStart(2, '0') + ":" + 
                       //now.getMinutes();
                       now.getMinutes().toString().padStart(2, '0');
    
            //データベースに保存する
            messagesRef.push({name:username, text:message,time:time});
            messageField.val('');
    
            $('#scroller').scrollTop($('#messages').height());

        }
    }
});

// データベースにデータが追加されたときに発動する
messagesRef.limitToLast(10).on('child_added', function (snapshot) {
    //取得したデータ
    var data = snapshot.val();
    var username = data.name || "anonymous";
    var message = data.text;
    var time = data.time;

    //取得したデータの名前が自分の名前なら右側に吹き出しを出す
    if ( username == nameField.val() ) {

        var messageElement = $("<il><p class='sender_name me'>" + username + "</p><p class='right_balloon'>" + message + "</p><p class='right_time'>" + time + "</p><p class='clear_balloon'></p></il>");

    } else {

        var messageElement = $("<il><p class='sender_name'>" + username + "</p><p class='left_balloon'>" + message + "</p><p class='left_time'>" + time + "</p><p class='clear_balloon'></p></il>");

    }

    //HTMLに取得したデータを追加する
    messageList.append(messageElement)

    //一番下にスクロールする
    messageList[0].scrollTop = messageList[0].scrollHeight;
});