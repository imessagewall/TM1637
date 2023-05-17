/**
* makecode Four Digit Display (TM1637) Package.
*/

/**
 * TM1637 digit Display
 */
//% weight=100 color=#50A820 icon="8" block="四位数码管"
namespace TM1637 {
    let TM1637_CMD1 = 0x40;  //数据命令，写数据模式
    let TM1637_CMD2 = 0xC0;  //地址命令，显示寄存器地址 00H  01H  02H  03H  04H  05H
    let TM1637_CMD3 = 0x80;  //显示控制，设置脉冲宽度
    let _SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];
    let clk = DigitalPin.P13;
    let dio = DigitalPin.P14;
    let buf = pins.createBuffer(4);
    let _ON = 4;  //8 显示打开   4 显示关闭
    let brightness = 6;
    let count = 4;

    /**
     * Start   设置clk低电平，dio上的变化才有效
     */
    function _start() {
        pins.digitalWritePin(dio, 0);
        pins.digitalWritePin(clk, 0);
        _ON = 8;
    }

    /**
     * Stop   clk高电平时，dio由低变高则代表停止信号
     */
    function _stop() {
        pins.digitalWritePin(dio, 0);
        pins.digitalWritePin(clk, 1);
        pins.digitalWritePin(dio, 1);
    }

    /**
     * send command1
     */
    function _write_data_cmd() {
        _start();
        _write_byte(TM1637_CMD1);
        _stop();
    }

    /**
     * 显示控制命令
     */
    function _write_dsp_ctrl() {
        _start();
        _write_byte(TM1637_CMD3 | _ON | brightness);
        _stop();
    }

    /**
     * send a byte to 2-wire interface
     */
    function _write_byte(b: number) {
        for (let i = 0; i < 8; i++) {
            pins.digitalWritePin(dio, (b >> i) & 1);
            pins.digitalWritePin(clk, 1);
            pins.digitalWritePin(clk, 0);
        }
        pins.digitalWritePin(clk, 1);
        pins.digitalWritePin(clk, 0);
    }

    /**
     * set data to TM1637, with given bit
     */
    function _dat(bit: number, dat: number) {
        _write_data_cmd();
        _start();
        _write_byte(TM1637_CMD2 | (bit % count))
        _write_byte(dat);
        _stop();
        _write_dsp_ctrl();
    }

    /**
     * show a number in given position. 
     * @param num number will show, eg: 5
     * @param bit the position of the LED, eg: 0
     */
    //% blockId="TM1637_showbit" block="在 %bit | 显示数字 %num"
    //% weight=90 blockGap=8
    export function showbit(bit: number = 0, num: number = 5) {
        buf[bit % count] = _SEGMENTS[num % 16]
        _dat(bit, _SEGMENTS[num % 16])
    }

    /**
      * show a number. 
      * @param num is a number, eg: 0
      */
    //% blockId="TM1637_shownum" block="显示数字 %num"
    //% weight=91 blockGap=8
    export function showNumber(num: number) {
        if (num < 0) {
            _dat(0, 0)
        }
        else {
            showbit(3, num % 10)
            showbit(2, (num / 10) % 10)
            showbit(1, (num / 100) % 10)
            showbit(0, (num / 1000) % 10)
        }
    }

    /**
     * show or hide dot point.  实际就是LED1的小数点
     */
    //% blockId="TM1637_showDP" block="显示点 %show"
    //% weight=70 blockGap=8
    export function showDP(show: boolean = true) {
        if (show) {
            _dat(1, buf[1] | 0x80)
        }
        else {
            _dat(1, buf[1] & 0x7F)
        }
    }

    /**
     * clear LED. 
     */
    //% blockId="TM1637_clear" block="清空显示"
    //% weight=80 blockGap=8
    export function clear() {
        for (let i = 0; i < count; i++) {
            _dat(i, 0)
            buf[i] = 0
        }
    }
}
