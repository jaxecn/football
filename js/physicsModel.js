class PhysicsModel {
    constructor() {

    }

    getMoveDistance(v0, a, t, name) {
        //v0指一开始的速度
        //a是加速度
        //t是时间，单位秒
        //name可以指定x轴和y轴，大写。
        const distance = t * (2 * v0 + a * t) / 2;
        name && (this.status[`before${name}V`] = v0 + a * t);
        return distance;
    }

    getYMoveDistance(direction, distance) {
        //获得实例在direction方向上移动了distance距离之后，y轴方向上移动的距离。
        return Math.sin(direction * Math.PI / 180) * distance;
    }

    getXUseCos(direction, distance) {
        //获得在direction方向上移动distance距离后的x轴的坐标。
        return Math.cos(direction * Math.PI / 180) * distance + this.location.x0;
    }

    getYUseSin(direction, distance) {
        //获得在direction方向上移动distance距离后的y轴的坐标。
        return Math.sin(direction * Math.PI / 180) * distance + this.location.y0;
    }
}