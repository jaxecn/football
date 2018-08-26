let count = 0;
let beforeTime = [];
class Footballer {
    constructor(ratio, svg) {
        this.ratio = ratio;
        this.dom = this.drawFootballer(svg);
        this.v = this.random(1, 100);
    }

    random(min, max) {
        return min + Math.floor((max - min) * Math.random());
    }

    getMaxV() {
        return Math.floor(3 + (this.v - 1) * ( 9 / 98 ));
    }

    drawFootballer(svg) {
        svg.innerHTML += `
            <circle id='footballer-${++count}'
                r=${this.ratio}
                fill='#000'
                transform="translate(${3.4 * this.ratio}, ${1.3 * this.ratio})"
                 >
            </circle>
        `;
        return svg.querySelector("#footballer-" + count);
    }

    run(sx, sy, ex, ey) {
        if(!beforeTime.length) {
            ////如果是第一次运行beforeTime会是null，更新它的值
            beforeTime.push(Date.now());
            window.requestAnimationFrame(() => this.run(sx, sy, ex, ey));
            return;
        }
        let maxV = this.getMaxV(),
            plusAcceleration = 2,
            subAccelerration = maxV / 2,
            nowTime = Date.now(),
            nowV = 0,
            xMove = 0,
            yMove = 0,
            ratio = this.ratio,
            t = (nowTime - beforeTime[0])/1000;

        if(t * plusAcceleration < maxV) {
            nowV = t * plusAcceleration;
        } else if (beforeTime.length != 3) {
            if(beforeTime.length == 1) {
                beforeTime.push(nowTime);
            };
            t = (nowTime - beforeTime[1])/1000;
            nowV = maxV;
        } else {
            t = (nowTime - beforeTime[2])/1000;
            nowV = maxV - t * subAccelerration;
        }
        
        function getXMove () {
            const moveDistance = getMoveDistance();
            xMove = ratio * (ex - sx) * moveDistance / Math.sqrt((ex - sx)**2 + (ey - sy)**2);
            return xMove;
        }

        function getYMove () {
            const moveDistance = getMoveDistance();
                  yMove = ratio * (ey - sy) * moveDistance / Math.sqrt((ex - sx)**2 + (ey - sy)**2);
            return yMove;
        }

        function getMoveDistance() {
            let moveDistance;
            switch (beforeTime.length) {
                case 1:
                    moveDistance = t * nowV / 2;
                    break;
                case 2:
                    var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                    moveDistance = t * maxV + t1 * maxV / 2;
                    break;
                case 3:
                    var t1 = (beforeTime[1] - beforeTime[0]) / 1000;
                    var t2 = (beforeTime[2] - beforeTime[1]) / 1000;
                    moveDistance = t2 * maxV + t1 * maxV / 2 + (maxV + nowV) * t / 2;
                    break;
            };
            return moveDistance;
        }

        this.dom.setAttribute('cx', sx + getXMove());
        this.dom.setAttribute('cy', sy + getYMove());
        if(Math.abs(ex - sx) > Math.abs(xMove) || Math.abs(ey - sy) > Math.abs(yMove)) {
            window.requestAnimationFrame(() => this.run(sx, sy, ex, ey));
        } else if(nowV > 0) {
            if(beforeTime.length == 2) {
                beforeTime.push(nowTime)
            }
            window.requestAnimationFrame(() => this.run(sx, sy, ex, ey));
        }
    }

}