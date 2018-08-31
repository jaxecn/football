class PhysicsModel {
    constructor() {

    }

    getMoveDistance(v0, a, t) {
        //v0:初始速度
        //a:加速度
        //t:时间，单位秒
        return this.ratio * (2 * v0 + a * t) * t / 2;
    }

    getXAndYOfMoveDistance(sx, sy, ex, ey, d) {
        //sx,sy分别代表运动开始时的坐标
        //ex,ey分别代表运动结束时的坐标
        //d代表在平面上移动的距离
        const xAndY = {
            x: d * (ex -sx) / Math.sqrt((ex -sx)**2 + (ey - sy)**2),
            y: d * (ey -sy) / Math.sqrt((ex -sx)**2 + (ey - sy)**2),
        }
        return xAndY;
    }

    getXUseCos(direction, distance) {
        return Math.cos(direction * Math.PI / 180) * distance + this.location.x0;
    }

    getYUseSin(direction, distance) {
        return Math.sin(direction * Math.PI / 180) * distance + this.location.y0;
    }
}