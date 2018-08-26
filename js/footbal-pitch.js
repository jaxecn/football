class FootballPitch {
    //按照球场的宽度基数73.2进行计算，相对窗口宽度可以增加的倍数
    //球场高度基数47.4px，宽度基数73.2px
    //背景为绿色的区域宽度基数为80，高度为50
    constructor() {
        this.ratio = this.getRatio();
        this.width = this.ratio * 80;
        this.height = this.ratio * 50;
    }

    getRatio() {
        const widthRatio = Math.floor(window.innerWidth / 80);
        const heightRatio = Math.floor(window.innerHeight / 50);
        return widthRatio < heightRatio ? widthRatio : heightRatio;
    }

    drawFootballPitch(svg) {
        const ratio = this.ratio,
              strokeWidth = `stroke-width: ${0.2 * this.ratio}`,
              stroke = 'stroke: #fff',
              fill = 'fill: #008001',
              style = `style="${fill}; ${strokeWidth}; ${stroke}`;//没加引号，使用时别忘了加
        svg.setAttribute('width', this.width);
        svg.setAttribute('height', this.height);
        svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        svg.innerHTML = `
            <g transform='translate(${3.4 * ratio}, ${1.3 * ratio})'>
                <rect 
                    width=${73.2 * ratio} 
                    height=${47.4 * ratio} 
                    x='0'
                    y='0'
                    ${style}" >
                </rect>
                <circle
                    cx=${36.6 * ratio}
                    cy=${23.7 * ratio}
                    r=${6.4 * ratio}
                    ${style}" >
                </circle>
                <line
                    x1=${36.6 * ratio}
                    y1='0'
                    x2=${36.6 * ratio}
                    y2=${47.4 * ratio}
                    ${style}" >
                </line>
                <rect 
                    width=${11.6 * ratio}
                    height=${28 * ratio}
                    x='0'
                    y=${9.7 * ratio}
                    ${style}" >
                </rect>
                <rect 
                    width=${4 * ratio}
                    height=${12.8 * ratio}
                    x='0'
                    y=${17.3 * ratio}
                    ${style}" >
                </rect>
                <rect 
                    width=${0.8 * ratio}
                    height=${5 * ratio}
                    x=${-0.8 * ratio}
                    y=${21.2 * ratio}
                    ${style}" >
                </rect>
                <circle 
                    cx=${7.6 * ratio}
                    cy=${23.7 * ratio}
                    r=${0.3 * ratio}
                    style="fill: #fff;" >
                </circle>
                
                <rect 
                    width=${11.6 * ratio}
                    height=${28 * ratio}
                    x=${61.6 * ratio}
                    y=${9.7 * ratio}
                    ${style}" >
                </rect>
                <rect
                    width=${4 * ratio}
                    height=${12.8 * ratio}
                    x=${69.2 * ratio}
                    y=${17.3 * ratio}
                    ${style}" >
                </rect>
                <rect 
                    width=${0.8 * ratio}
                    height=${5 * ratio}
                    x=${73.2 * ratio}
                    y=${21.2 * ratio}
                    ${style}" >
                </rect>
                <circle 
                    cx=${65.6 * ratio}
                    cy=${23.7 * ratio}
                    r=${0.3 * ratio}
                    style="fill: #fff;" >
                </circle>
                <circle
                    cx=${36.6 * ratio}
                    cy=${23.7 * ratio}
                    r=${0.3 * ratio}
                    style="fill: #fff;" >
                </circle>
            </g>
        `;
    }
}