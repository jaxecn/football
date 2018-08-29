let count = 0;
class Footballer {
    constructor(ratio, svg) {
        this.ratio = ratio;
        this.dom = this.drawFootballer(svg);
        this.v = this.random(1, 100);
        this.power = this.random(1, 100);
        this.stamina = this.random(1, 100);
        //该属性用来记录速度状态改变时的时间点
        this.status = { index: 0, beforeTime: [] };
        this.endPointV = null;
    }

    random(min, max) {
        return min + Math.floor((max - min) * Math.random());
    }

    getMaxV() {
        return Math.floor(3 + (this.v - 1) * ( 9 / 98 ));
    }

    getAcceleration() {
        const maxV = this.getMaxV();
        const acceleration = maxV / (4 + (1 - this.power) * 3 / 98);
        return acceleration;
    }

    getStaminaInMaxV() {
        const sec = 10 + (this.stamina - 1) * 5 / 98;
        return sec;
    }

    drawFootballer(svg) {
        const NS = 'http://www.w3.org/2000/svg';
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('id', `footballer-${++count}`);
        circle.setAttribute('r', `${this.ratio}`);
        circle.setAttribute('fill', '#000');
        circle.setAttribute('transform', `translate(${3.4 * this.ratio}, ${1.3 * this.ratio})`);
        svg.appendChild(circle);
        // svg.innerHTML += `
        //     <circle id='footballer-${++count}'
        //         r=${this.ratio}
        //         fill='#000'
        //         transform="translate(${3.4 * this.ratio}, ${1.3 * this.ratio})"
        //          >
        //     </circle>
        // `;
        return circle;
    }

    run(sx, sy, ex, ey) {
        const beforeTime = this.status.beforeTime;
        if(!this.status.index) {
            ////如果是第一次运行status.index状态值为0，更新它的值
            this.status.index = 1;
            beforeTime.push(Date.now());
            window.requestAnimationFrame(() => this.run(sx, sy, ex, ey));
            return;
        };
        let maxV = this.getMaxV(),
            generalV = maxV / 2,
            endPointV = this.endPointV,
            Acceleration = Math.round(this.getAcceleration()),
            minusAccelerration = endPointV,
            stamina = Math.round(this.getStaminaInMaxV()),
            nowTime = Date.now(),
            ratio = this.ratio,
            nowV = null,
            xMove = null,
            yMove = null,
            t = null;

        if(!endPointV) {
            //意思就是还没到终点时执行该代码块。
            switch(this.status.index) {
                //5个case分别代表5个不同的时间点，
                //分别是起步加速，到达最大值匀速，持久力耗尽减速，
                //匀速，到达终点减速5个状态。
                case 1:
                    t = (nowTime - beforeTime[0])/1000;
                    nowV = t * Acceleration;
                    //状态值改变的同时t一定要初始化为0，不然会影响到之后计算移动距离。下同。
                    nowV >= maxV && (nowV = maxV, beforeTime.push(nowTime), this.status.index = 2, t = 0);
                    break;
                case 2:
                    t = (nowTime - beforeTime[1])/1000;
                    nowV = maxV;
                    t >= stamina && (beforeTime.push(nowTime), this.status.index = 3, t = 0);
                    break;
                case 3:
                    t = (nowTime - beforeTime[2])/1000;
                    nowV = maxV - t * generalV;//这里耗尽体力减速时的加速度设为generalV
                    nowV <= generalV && (nowV = generalV, beforeTime.push(nowTime), this.status.index = 4, t = 0);
                    break;
                case 4:
                    t = (nowTime - beforeTime[3])/1000;
                    nowV = generalV;
                    break;
            };

            var getMoveDistance = () => {
                let moveDistance;
                switch (this.status.index) {
                    case 1:
                        moveDistance = t * nowV / 2;
                        break;
                    case 2:
                        var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                        moveDistance = t * nowV + t1 * maxV / 2;
                        break;
                    case 3:
                        var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                        var t2 = (beforeTime[2] - beforeTime[1]) / 1000;
                        moveDistance = t2 * maxV + t1 * maxV / 2 + (maxV + nowV) * t / 2;
                        break;
                    case 4:
                        var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                        var t2 = (beforeTime[2] - beforeTime[1]) / 1000;
                        var t3 = (beforeTime[3] - beforeTime[2]) / 1000;
                        moveDistance = t1 * maxV / 2 + t2 * maxV + (maxV + generalV) * t3 / 2 + nowV * t;
                        break;
                };
                return moveDistance;
            };
        } else {
            //到达终点时执行该代码块
            updateNowVAfterEndPoint(this.status.index);
            var getMoveDistance = () => {
                let moveDistance;
                switch (this.status.index) {
                    case 1:
                        var t1 = beforeTime[1] - beforeTime[0];
                        moveDistance = t1 * endPointV / 2 + t * (endPointV + nowV) / 2;
                        break;
                    case 2:
                        var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                        var t2 = (beforeTime[2] - beforeTime[1]) / 1000;
                        moveDistance = t1 * maxV / 2 + t2 * maxV + t * (endPointV + nowV) / 2;
                        break;
                    case 3:
                        var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                        var t2 = (beforeTime[2] - beforeTime[1]) / 1000;
                        var t3 = (beforeTime[3] - beforeTime[2]) / 1000;
                        moveDistance = t1 * maxV / 2 + t2 * maxV + t3 * (maxV + endPointV) / 2 + t * (endPointV + nowV) / 2;
                        break;
                    case 4:
                        var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                        var t2 = (beforeTime[2] - beforeTime[1]) / 1000;
                        var t3 = (beforeTime[3] - beforeTime[2]) / 1000;
                        var t4 = (beforeTime[4] - beforeTime[3]) / 1000;
                        moveDistance = t1 * maxV / 2 + t2 * maxV + t3 * (maxV + endPointV) / 2 + t4 * generalV + t * (endPointV + nowV) / 2;
                        break;
                };
                return moveDistance;
            };
        }

        function updateNowVAfterEndPoint(status) {
            beforeTime.length == status && beforeTime.push(nowTime);
            t = (nowTime - beforeTime[status])/1000;
            nowV = endPointV - t * minusAccelerration;
        }
        
        function getXMove () {
            const moveDistance = getMoveDistance();
            xMove = ratio * (ex - sx) * moveDistance / Math.sqrt((ex - sx)**2 + (ey - sy)**2);
            return xMove;
        };

        function getYMove () {
            const moveDistance = getMoveDistance();
            yMove = ratio * (ey - sy) * moveDistance / Math.sqrt((ex - sx)**2 + (ey - sy)**2);
            return yMove;
        };

        this.dom.setAttribute('cx', sx + getXMove());
        this.dom.setAttribute('cy', sy + getYMove());

        if(Math.abs(ex - sx) > Math.abs(xMove) || Math.abs(ey - sy) > Math.abs(yMove)) {
            window.requestAnimationFrame(() => this.run(sx, sy, ex, ey));
        } else if(nowV > 0) {
            endPointV || (this.endPointV = nowV);
            window.requestAnimationFrame(() => this.run(sx, sy, ex, ey));
        } else {
            this.endPointV = null;
            this.status = { index: 0, beforeTime: [] };
        }
    }
}