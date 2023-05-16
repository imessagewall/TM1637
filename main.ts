
/**
* makecode Four Digit Display (TM1637) Package.
*/

/**
 * TM1637 digit Display
 */
//% weight=100 color=#50A820 icon="8" block="四位数码管"
namespace TM1637 {
    let TM1637_CMD1 = 0x40;
    let TM1637_CMD2 = 0xC0;
    let TM1637_CMD3 = 0x80;
    let _SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];
    let clk = DigitalPin.P13;
    let dio = DigitalPin.P14;
    let buf = pins.createBuffer(4);
    let _ON = 4;
    let brightness = 7;
    let count = 4;

    /**
     * Start 
     */
    function _start() {
        pins.digitalWritePin(dio, 0);
        pins.digitalWritePin(clk, 0);
        _ON = 8;
    }

    /**
     * Stop
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
     * send command3
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
     * set TM1637 intensity, range is [0-8], 0 is off.
     * @param val the brightness of the TM1637, eg: 7
     */
    function intensity(val: number = 7) {
        if (val < 1) {
            off();
            return;
        }
        if (val > 8) val = 8;
        _ON = 8;
        brightness = val - 1;
        _write_data_cmd();
        _write_dsp_ctrl();
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
     * 打开显示
     */
    //% blockId="TM1637_on" block="打开"
    //% weight=50 blockGap=8
    export function on() {
        _ON = 8;
        _write_data_cmd();
        _write_dsp_ctrl();
    }

    /**
     * 关闭显示
     */
    //% blockId="TM1637_off" block="关闭"
    //% weight=50 blockGap=8
    export function off() {
        _ON = 0;
        _write_data_cmd();
        _write_dsp_ctrl();
    }


    /**
     * show a number in given position. 
     * @param num number will show, eg: 5
     * @param bit the position of the LED, eg: 0
     */
    //% blockId="TM1637_showbit" block="显示数字 %num|在 %bit"
    //% weight=90 blockGap=8
    export function showbit(num: number = 5, bit: number = 0) {
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
            _dat(0, 0x40) // '-'
            num = -num
        }
        else
            showbit((num / 1000) % 10)
        showbit(num % 10, 3)
        showbit((num / 10) % 10, 2)
        showbit((num / 100) % 10, 1)
    }

    /**
     * show or hide dot point. 
     * @param bit is the position, eg: 1
     * @param show is show/hide dp, eg: true
     */
    //% blockId="TM1637_showDP" block="显示小数点 %bit|是否显示 %show"
    //% weight=70 blockGap=8
    export function showDP(bit: number = 1, show: boolean = true) {
        bit = bit % count
        if (show) _dat(bit, buf[bit] | 0x80)
        else _dat(bit, buf[bit] & 0x7F)
    }

    /**
     * clear LED. 
     */
    //% blockId="TM1637_clear" block="清空"
    //% weight=80 blockGap=8
    export function clear() {
        for (let i = 0; i < count; i++) {
            _dat(i, 0)
            buf[i] = 0
        }
    }


}
