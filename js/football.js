class Football extends PhysicsModel {
    constructor(svg, ratio) {
        super();
        this.ratio = ratio;
        this.startTime = null;
        this.isChangeLocation = false;
        this.location = {
            x0: 50,
            y0: 50,
            newX: null,
            newY: null,
        };
        this.isMove = false;
        this.dom = this.drawFootball(svg);
    }

    drawFootball(svg) {
        const S_NS = 'http://www.w3.org/2000/svg';
        const X_NS = 'http://www.w3.org/1999/xlink';
        const football = document.createElementNS(S_NS, 'image');
        const line = document.createElementNS(S_NS, 'line');
        const group1 = document.createElementNS(S_NS, 'g');
        const group2 = document.createElementNS(S_NS, 'g');
        football.setAttribute('width', 1 * this.ratio);
        football.setAttribute('height', 1 * this.ratio);
        football.setAttribute('x', this.location.x0);
        football.setAttribute('y', this.location.y0);
        football.setAttributeNS(X_NS, 'xlink:href', './images/football.png');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', 0.5 * this.ratio);
        line.setAttribute('x2', 2 * this.ratio);
        line.setAttribute('y2', 0.5 * this.ratio);
        line.setAttribute('style', `stroke: red; stroke-width: ${0.3 * this.ratio}`);
        line.setAttribute('opacity', '0');
        group1.setAttribute('transform', `translate(${3.4 * this.ratio}, ${1.3 * this.ratio})`);
        group2.appendChild(line);
        group2.appendChild(football);
        group1.appendChild(group2);
        svg.appendChild(group1);
        return football;
    }

    move({direction, v0, a}) {
        //参数分别是运动方向，初始速度，加速度
        if(!this.startTime) {
            this.isMove = true;
            this.startTime = Date.now();
            window.requestAnimationFrame(() => this.move({direction, v0, a}));
        } else {
            const nowTime = Date.now();
            const t = (nowTime - this.startTime) / 1000;
            const moveDistance = this.getMoveDistance(v0, a, t);
            const newX = this.getXUseCos(direction, moveDistance);
            const newY = this.getYUseSin(direction, moveDistance);
            //更新实例的坐标属性
            this.location.newX = newX;
            this.location.newY = newY;
            this.dom.setAttribute('x', newX);
            this.dom.setAttribute('y', newY);
            const leftNet = newX <= -0.8 * this.ratio && newY >= 21.2 * this.ratio && newY <= 26.2 * this.ratio,
                rightNet = newX >= 74 * this.ratio && newY >= 21.2 * this.ratio && newY <= 26.2 * this.ratio;
            //判断是否进球。    
            if(leftNet || rightNet) {
                this.isMove = false;
            }
    
            if(Math.abs(a * t) < v0 && this.isMove) {
                window.requestAnimationFrame(() => this.move({direction, v0, a}));
            } else {
                this.isMove = false;
                this.startTime = null;
                const l = this.location;
                l.x0 = newX;
                l.y0 = newY;
                l.newX = null;
                l.newY = null;
            }
        }
    }
}