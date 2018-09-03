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

    drawFootballer(svg) {
        const NS = 'http://www.w3.org/2000/svg';
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('id', `footballer-${count++}`);
        circle.setAttribute('r', `${this.ratio}`);
        circle.setAttribute('fill', '#000');
        circle.setAttribute('cx', this.location.x0);
        circle.setAttribute('cy', this.location.y0);
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

    getMoveDirection(ex, ey) {
        return Math.atan2(ey - this.location.y0, ex - this.location.x0) * 180 / Math.PI;
    }

    kickFootball(football, ballPara) {
        if(this.id === Footballer.whoIsGotBall) {
            Footballer.whoIsGotBall = 0;
            this.dom.removeAttribute('stroke');
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
                if(!Footballer.count) {
                    status.xA = xV - status.beforeXV / 1;
                    status.yA = yV - status.beforeYV / 1;
                    Footballer.count = 1;
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
                    Footballer.count = 0;
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


        this.dom.setAttribute('cx', location.newX + xMove);
        this.dom.setAttribute('cy', location.newY + yMove);

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