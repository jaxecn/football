let count = 0;
class Footballer extends PhysicsModel {
    constructor({ ratio, svg, v, power, stamina, force, skill }) {
        super();
        this.id = count + 1;
        this.ratio = ratio;
        this.location = {
            x0: this.random(0, 73.2 * ratio),
            y0: this.random(0, 47.4 * ratio),
            newX: undefined,
            newY: undefined,
        };
        this.dom = this.drawFootballer(svg);
        this.v = v;
        this.power = power;
        this.stamina = stamina;
        this.force = force;
        this.skill = skill;
        this.status = {
            index: 0,
            index0: 0,
            beforeTime: 0,
            beforeV: 0,
            beforeXV: 0,
            beforeYV: 0,
            startTimeOfMaxV: 0,
            startTimeOnChangeDirection: 0,
            xA: 0,
            yA: 0,
        };
        this.direction = null;
        this.endPointV = null;
        this.endPointLocation = null;
        this.isRun = false;
        this.isStop = true;
        this.isChangeDirection = false;
    }

    random(min, max) {
        return min + Math.floor((max - min) * Math.random());
    }

    getMaxV() {
        return 3 + (this.v - 1) * 9 / 98;
    }

    getMaxV0() {
        return 5 + (this.force - 1) * 45 / 98;
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

    getVarianceOfDirection() {
        //为了简化问题，技术值为99的标准差为1，方差为1
        //技术值为1的标准差为为3，方差为9
        //假设技术值与方差呈线性关系。
        return 9 + (1 - this.skill) * 4 / 49;
    }

    getVarianceOfV0() {
        //同上。
        return 9 + (1 - this.skill) * 4 / 49;
    }

    getProbabilityUseVariance() {
        //用求得的方差求获得期望值的概率
        const variD = this.getVarianceOfDirection(),
            variV = this.getVarianceOfV0(),
            //下表是指经过简化的标准正态分布表。
            list = [0.5000, 0.5398, 0.5793, 0.6179, 0.6554, 0.6915, 0.7257, 0.7580, 0.7881, 0.8159, 0.8413, 0.8643, 0.8849, 0.9032, 0.9192, 0.9332, 0.9452, 0.9554, 0.9641, 0.9713, 0.9772, 0.9821, 0.9861, 0.9893, 0.9918, 0.9938, 0.9953, 0.9965, 0.9974, 0.9981, 0.9987];
        const probaD = list[Math.round(10 * 3 / Math.sqrt(variD))] * 2 - 1,
            probaV = list[Math.round(10 * 3 / Math.sqrt(variV))] * 2 - 1;
        return { probabilityD: probaD, probabilityV0: probaV, };
    }

    drawFootballer(svg) {
        const NS = 'http://www.w3.org/2000/svg';
        const circle = document.createElementNS(NS, 'circle');
        const text = document.createElementNS(NS, 'text');
        circle.setAttribute('id', `footballer-${count++}`);
        circle.setAttribute('r', `${this.ratio}`);
        circle.setAttribute('fill', '#000');
        circle.setAttribute('cx', this.location.x0);
        circle.setAttribute('cy', this.location.y0);
        circle.setAttribute('transform', `translate(${3.4 * this.ratio}, ${1.3 * this.ratio})`);
        text.innerHTML = count;
        text.setAttribute('x', this.location.x0);
        text.setAttribute('y', this.location.y0);
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-size', 1.6 * this.ratio);
        if(count < 10) {
            text.setAttribute('transform', `translate(${3 * this.ratio}, ${1.8 * this.ratio})`);
        } else {
            text.setAttribute('transform', `translate(${2.6 * this.ratio}, ${1.8 * this.ratio})`);
        }
        svg.appendChild(circle);
        svg.appendChild(text);
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

    getMoveDirection(ex, ey) {
        return Math.atan2(ey - this.location.y0, ex - this.location.x0) * 180 / Math.PI;
    }

    kickFootball(football, ballPara) {
        if(this.id === Footballer.whoIsGotBall) {
            Footballer.whoIsGotBall = 0;
            this.dom.removeAttribute('stroke');
            const probability = this.getProbabilityUseVariance();
            console.log('随机之前', ballPara, probability);
            if(Math.random() >= probability.probabilityD) {
                Math.random() < 0.5 ? ballPara.direction += 10 : ballPara.direction -= 10;
            }
            if(Math.random() >= probability.probabilityV0) {
                Math.random() < 0.5 ? ballPara.v0 += 10 : ballPara.v0 -= 10;
            }
            console.log('随机之后', ballPara, probability);
            football.ballPara = ballPara;
            football.isMove = true;
            football.move();
        }
    }

    run() {
        const status = this.status,
            location = this.location;
        if (!status.index) {
            status.index = 1;
            status.beforeTime = Date.now() / 1000;
            location.newX = location.x0;
            location.newY = location.y0;
            // window.requestAnimationFrame(() => this.run(ex, ey));
            return;
        }
        let maxV = this.getMaxV(),
            generalV = maxV / 2,
            acceleration = this.getAcceleration(),
            stamina = this.getStaminaInMaxV(),
            nowTime = Date.now() / 1000,
            t = nowTime - status.beforeTime,
            ratio = this.ratio,
            xMove = 0,
            yMove = 0;
        //更新时间，供下次循环计算。
        status.beforeTime = nowTime;

        switch (status.index) {
            case 1:
                status.xA = Math.cos(this.direction * Math.PI / 180) * acceleration;
                status.yA = Math.sin(this.direction * Math.PI / 180) * acceleration;
                status.beforeV += acceleration * t;
                if (status.beforeV >= maxV) {
                    status.beforeV = maxV;
                    status.index = 2;
                }
                console.log(1);
                break;
            case 2:
                status.startTimeOfMaxV || (status.startTimeOfMaxV = nowTime - t);
                status.xA = 0;
                status.yA = 0;
                if (nowTime - status.startTimeOfMaxV >= stamina) {
                    status.index = 3;
                    status.startTimeOfMaxV = 0;
                }
                console.log(2);
                break;
            case 3:
                //在第三阶段的减速度设为一般速度。
                status.xA = Math.cos(this.direction * Math.PI / 180) * -1 * generalV;
                status.yA = Math.sin(this.direction * Math.PI / 180) * -1 * generalV;
                status.beforeV += -1 * generalV * t;
                if (status.beforeV <= generalV) {
                    status.beforeV = generalV;
                    status.beforeXV = -1 * status.xA;
                    status.beforeYV = -1 * status.yA;
                    status.index = 4;
                }
                console.log(3);
                break;
            case 4:
                status.xA = 0;
                status.yA = 0;
                console.log(4);
                break;
            case 5:
                status.startTimeOnChangeDirection || (status.startTimeOnChangeDirection = nowTime - t);
                const xV = Math.cos(this.direction * Math.PI / 180) * status.beforeV;
                const yV = Math.sin(this.direction * Math.PI / 180) * status.beforeV;
                //1是指在1秒内完成方向的变换。
                if(!this.isChangeDirection) {
                    status.xA = xV - status.beforeXV / 1;
                    status.yA = yV - status.beforeYV / 1;
                    this.isChangeDirection = true;
                }
                if (nowTime - status.startTimeOnChangeDirection >= 1) {
                    //变换好方向之后，还要重新矫正球运动的方向。
                    location.x0 = location.newX;
                    location.y0 = location.newY;
                    const end = this.endPointLocation;
                    this.direction = this.getMoveDirection(end.x, end.y);
                    status.beforeXV = Math.cos(this.direction * Math.PI / 180) * status.beforeV;
                    status.beforeYV = Math.sin(this.direction * Math.PI / 180) * status.beforeV;
                    status.index = status.index0;
                    status.index0 = 0;
                    status.startTimeOnChangeDirection = 0;
                    this.isChangeDirection = false;
                }
                console.log(5);
                break;
            case 6:
                this.endPointV || (this.endPointV = status.beforeV);
                //到达终点时的减速度设为到达终点时速度的2倍，这样可以在0.5秒停下来。
                status.xA = Math.cos(this.direction * Math.PI / 180) * -2 * this.endPointV;
                status.yA = Math.sin(this.direction * Math.PI / 180) * -2 * this.endPointV;
                status.beforeV += -2 * this.endPointV * t;
                if (status.beforeV <= 0) {
                    init(this);
                    return;
                }
                console.log(6);
                break;
        }

        xMove = ratio * this.getMoveDistance(status.beforeXV, status.xA, t, 'X');
        yMove = ratio * this.getMoveDistance(status.beforeYV, status.yA, t, 'Y');

        const sibling = this.dom.nextElementSibling;
        this.dom.setAttribute('cx', location.newX + xMove);
        this.dom.setAttribute('cy', location.newY + yMove);
        sibling.setAttribute('x', location.newX + xMove);
        sibling.setAttribute('y', location.newY + yMove);

        location.newX += xMove;
        location.newY += yMove;

        function init(_this) {
            const location = _this.location;
            _this.endPointV = null;
            _this.endPointLocation = null;
            _this.direction = null;
            _this.status = {
                index: 0,
                index0: 0,
                beforeTime: 0,
                beforeV: 0,
                beforeXV: 0,
                beforeYV: 0,
                startTimeOfMaxV: 0,
                startTimeOnChangeDirection: 0,
                xA: 0,
                yA: 0,
            };
            location.x0 = location.newX;
            location.y0 = location.newY;
            _this.isRun = false;
            _this.isStop = true;
        }
    }
}