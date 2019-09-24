import './game.css'
//配置
interface Config {
    rows: number
    cols: number
    gameDom: HTMLElement | null
    splitSize: number
    infoDom: HTMLElement | null
    btnReset: HTMLElement | null
}
type NextChess = 2 | 1
type MyTurn = 0 | 1

let config: Config = {
    rows: 15, //行数
    cols: 15, //列数
    gameDom: document.getElementById("game"),//游戏的dom元素
    splitSize: 40, //棋子之间间隔的像素值
    infoDom: document.getElementById("info"),
    btnReset: document.getElementById("reset") //获取重置按钮
}
//棋盘
//棋盘中有很多棋子
//0: 没有棋子，1：黑子，2：白子
let board: any = undefined;
let nextChess: NextChess = 1; //下一个棋子的类型
let isGameOver: boolean = false; //游戏是否结束
let myTurn: MyTurn = 0     //是否轮到


let ws:WebSocket = new WebSocket("ws://localhost:12306/");
// 建立连接触发
ws.onopen = function () {
    console.log("open ws");
    ws.send("open ws");
};
// 接收服务端数据触发
ws.onmessage = function (evt) {
    let data = evt.data.split(',');
    myTurn++
    if (myTurn == 2) {
        regEvent()
    }
    //从服务器收到消息后渲染棋子
    putChess(data[0], data[1])
};
// 断开连接触发
ws.onclose = function () {
    console.log("close ws");
};


/**
 * 初始化所有棋子
 */
function initBoard() {
    board = new Array(config.rows);
    for (let i = 0; i < board.length; i++) {
        board[i] = new Array(config.cols);//每一行是由很多列组成的数组
        //给数组的每一项赋值为0
        board[i].fill(0); //fill是数组的方法，用于将数组的每一项填充为某个值
    }
}

/**
 * 初始化
 */
function init() {
    nextChess = 1; //初始化为下一个棋子为黑棋
    isGameOver = false; //游戏还未结束
    config.gameDom ? config.gameDom.innerHTML = '' : ''; //清空之前的内容
    initBoard();
    regEvent();
    showInfo();
}

/**
 * 向指定的行和列放置一个棋子
 */
function putChess(row: number, col: number) {
    //验证行和列
    if (row < 0 || col < 0 || row > config.rows - 1 || col > config.cols - 1) {
        return; //无效的行或列
    }
    if (board[row][col]) {
        //这个位置不为0，有棋子
        return;
    }
    board[row][col] = nextChess;
    //创建dom并显示
    let div = document.createElement("div");
    div.className = "chess " + (nextChess === 1 ? "black" : "white");
    //坐标
    div.style.left = col * config.splitSize + "px";
    div.style.top = row * config.splitSize + "px";
    config.gameDom ? config.gameDom.appendChild(div) : '';
    if (nextChess === 1) {
        //之前是黑子
        nextChess = 2;
    }
    else {
        //之前是白棋
        nextChess = 1;
    }

    //胜负判断
    if (hasWin(row, col)) {
        //游戏结束了
        isGameOver = true;
        config.gameDom ? config.gameDom.onclick = null : ''; //事件取消
    }
    showInfo();
}

/**
 * 得到棋盘上指定的行和列上的内容，0，1，2
 *
 */
function getChess(row: number, col: number) {
    if (board[row] === undefined) {
        return; //没有这一行
    }
    else if (board[row][col] === undefined) {
        return; //没有这一列
    }
    return board[row][col];
}

/**
 * 是否有人胜利了
 * 传递的参数：落子的行和列
 */
function hasWin(row: number, col: number) {
    let chess = getChess(row, col); //得到当前的棋子, 1, 2
    //横向是否有五子相连
    let line: number = 1;
    for (let i: number = col - 1; getChess(row, i) === chess; i--) {
        line++; //计数+1
    }
    for (let i: number = col + 1; getChess(row, i) === chess; i++) {
        line++; //计数+1
    }
    if (line >= 5) {
        return true; //游戏结束
    }
    //纵向是否有五子相连
    line = 1;
    for (let i = row - 1; getChess(i, col) === chess; i--) {
        line++; //计数+1
    }
    for (let i = row + 1; getChess(i, col) === chess; i++) {
        line++; //计数+1
    }
    if (line >= 5) {
        return true; //游戏结束
    }
    //正斜线
    line = 1;
    for (let i = row - 1, j = col + 1; getChess(i, j) === chess; i-- , j++) {
        line++; //计数+1
    }
    for (let i = row + 1, j = col - 1; getChess(i, j) === chess; i++ , j--) {
        line++; //计数+1
    }
    if (line >= 5) {
        return true; //游戏结束
    }
    //反斜线
    line = 1;
    for (let i = row - 1, j = col - 1; getChess(i, j) === chess; i-- , j--) {
        line++; //计数+1
    }
    for (let i = row + 1, j = col + 1; getChess(i, j) === chess; i++ , j++) {
        line++; //计数+1
    }
    if (line >= 5) {
        return true; //游戏结束
    }
}


/**
 * 注册点击事件
 */
function regEvent() {
    if (config.gameDom) {
        config.gameDom.onclick = function (e) {
            console.log(1)
            if (e.target && e.target.classList.contains("chess")) {
                //如果鼠标点击的dom，类样式中包含了chess，则表示，你点击的是棋子
                //不做任何操作
                return;
            }
            let x:number = e.offsetX - 20,
                y:number = e.offsetY - 20;
            let col: number = Math.round(x / config.splitSize),
                row: number = Math.round(y / config.splitSize)
            let sendData:any = [col,row]
            ws.send(sendData)
            config.gameDom ? config.gameDom.onclick = null : ''
            myTurn = 0
            //        putChess(row, col);
        }
        config.btnReset ? config.btnReset.onclick = init : '';
    }
}

/**
 * 显示信息
 */
function showInfo() {
    if (isGameOver) {
        let who;
        if (nextChess === 1) {
            who = "白棋胜利"
        }
        else {
            who = "黑棋胜利"
        }
        config.infoDom ? config.infoDom.innerHTML = "游戏结束！" + who : '';
    }
    else {
        let who;
        if (nextChess === 1) {
            who = "轮到黑棋"
        }
        else {
            who = "轮到白棋"
        }
        config.infoDom ? config.infoDom.innerHTML = who : '';
    }
}

init();