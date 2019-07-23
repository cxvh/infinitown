import * as THREE  from 'three';
import * as BufferGeometryUtils from 'three/examples/js/utils/BufferGeometryUtils'
import state from 'module/state';
import InitCarPoints from 'module/initCarPoints';
import Buffer from 'module/updateTablePositionRender';
import Common from 'module/types';

/**
 * 随机获取数组中的元素
 * @param {!Object} options
 * @return {?}
 */
function getElementByRandom(options) {
    return options[Math.floor(Common.random() * options.length)];
}

/**
 * @param {!Function} blocksObjects
 * @param {!Object} lanesObjects
 * @param {number} intersectionsObjects
 * @param {?} carsObjects
 * @param {?} cloudsObjects
 * @return {undefined}
 */
var getNeighboringCarsUpdate = function(blocksObjects, lanesObjects, intersectionsObjects, carsObjects, cloudsObjects) {
    /** @type {boolean} */
    this._containsStadium = false;
    /** @type {!Function} */
    this.blocks = blocksObjects;
    /** @type {!Array} */
    this.lanes = [];
    /** @type {number} */
    this.intersections = intersectionsObjects;
    this.carObjects = carsObjects;
    /** @type {!Array} */
    this.mobs = [];
    /** @type {!Array} */
    this.chunks = [];
    this.cloudObjects = cloudsObjects;
    lanesObjects.forEach(function(item) {
        switch(item.name) {
            // 类型为1的路加十个
        case 'Road_Lane_01_fixed':
            var e = 0;
            for (; e < 10; e++) {
                this.lanes.push(item);
            }
            break;
            //类型为3的加5个
        case 'Road_Lane_03_fixed':
            e = 0;
            for (; e < 5; e++) {
                this.lanes.push(item);
            }
        }
    }, this);
    this._generate();
};
getNeighboringCarsUpdate.inherit(Object, {
    getChunkData : function(x, y) {
        return x = x % state.TABLE_SIZE, y = y % state.TABLE_SIZE, x < 0 && (x = state.TABLE_SIZE + x), y < 0 && (y = state.TABLE_SIZE + y), void 0 !== this.chunks[x] && (void 0 !== this.chunks[x][y] && this.chunks[x][y]);
    },
    getNeighboringCars : function() {
    // 获取相邻的车
    /** @type {!Array} */
        var neighCars = [];

        return function(s) {
            return neighCars.length = 0, s.parent.traverse(function(sub) {
                // 把周围的车获取到，并存储在数组中
                if ('car' === sub.name && sub !== s) {
                    neighCars.push(sub);
                }
            }), this._forEachNeighboringChunk(s.parent.tableX, s.parent.tableY, function(spUtils) {
                // 遍历相邻的块
                spUtils.traverse(function(e) {
                    if ('car' === e.name) {
                        neighCars.push(e);
                    }
                });
            }), neighCars;
        };
    }(),
    update : function(target) {
        this.mobs.forEach(function(e) {
            e.update(target);
        });
    },
    _forEachNeighboringChunk : function() {
        // 遍历相邻的分块
        var menu = new THREE.Vector2;
        /** @type {!Array} */
        var pipelets = [new THREE.Vector2(-1, -1), new THREE.Vector2(1, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1), new THREE.Vector2(0, 1), new THREE.Vector2(-1, 0), new THREE.Vector2(-1, 0), new THREE.Vector2(0, -1)];
        return function(x, y , callback) {
            menu.set(x, y);
            pipelets.forEach(function(e) {
                menu.add(e);
                // 获取分块中的数据
                var each1 = this.getChunkData(menu.x, menu.y);
                if (each1) {
                    callback(each1.node);
                }
            }, this);
        };
    }(),
    _getNeighboringBlocks : function() {
    /** @type {!Array} */
        var parkNames = [];
        // 根据坐标遍历四周的相邻分块
        return function(x, y) {
            return parkNames.length = 0, this._forEachNeighboringChunk(x, y, function(dep) {
                parkNames.push(dep.block.name);
            }), parkNames;
        };
    }(),
    _getRandomBlockAt : function(pieceX, pieceY) {
        var block;
        /** @type {number} */
        var i = 0;
        // 获取相邻的块
        var piece = this._getNeighboringBlocks(pieceX, pieceY);
        for (; i < 100;) {
            var randomBlock = getElementByRandom(this.blocks).clone();
            var name = randomBlock.name;
            if ('block_8_merged' === name) {
                if (this._containsStadium) {
                    i++;
                    continue;
                }
                /** @type {boolean} */
                this._containsStadium = true;
                block = randomBlock;
                break;
            }
            if (piece.indexOf(name) === -1) {
                block = randomBlock;
                break;
            }
            i++;
        }
        return block;
    },
    _getRandomChunk : function(x, y) {
        var matrix = new THREE.Matrix4;
        var matrixWorldInverse = (new THREE.Matrix4).makeRotationY(Math.PI / 2);
        var randomChunkObject3 = new THREE.Object3D;
        // 设置默认名称
        randomChunkObject3.name = 'chunk';
        // 获取随机的块
        var block = this._getRandomBlockAt(x, y);
        var defaultYPos = Math.round(4 * Common.random()) * (Math.PI / 2);
        block.rotation.y = defaultYPos;
        block.position.set(0, 0, 0);
        randomChunkObject3.add(block);
        randomChunkObject3.block = block;
        // 随机车道信息，用来存储获取的随机四个车道
        var randomLanes = [];
        // 随机取第一个车道
        var randomFirstLane = getElementByRandom(this.lanes).clone();
        randomFirstLane.position.set(-30, 0, 10);
        randomChunkObject3.add(randomFirstLane);
        randomLanes.push(randomFirstLane);
        // 随即取第二个车道
        var randomSecondLane = getElementByRandom(this.lanes).clone();
        randomSecondLane.position.set(-30, 0, -10);
        matrix.makeTranslation(0, 0, -20);
        randomSecondLane.geometry = randomSecondLane.geometry.clone();
        randomFirstLane.geometry = randomFirstLane.geometry.clone();
        randomSecondLane.geometry.applyMatrix(matrix);
        randomLanes.push(randomSecondLane);
        // 随机取第三个车道
        var randomThirdLane = getElementByRandom(this.lanes).clone();
        randomThirdLane.position.set(-10, 0, -30);
        randomThirdLane.rotation.y = Math.PI / 2;
        randomLanes.push(randomThirdLane);
        matrix.makeTranslation(20, 0, -40);
        randomThirdLane.geometry = randomThirdLane.geometry.clone();
        randomThirdLane.geometry.applyMatrix(matrixWorldInverse);
        randomThirdLane.geometry.applyMatrix(matrix);
        // 随机取第四个车道
        var randomFourthLane = getElementByRandom(this.lanes).clone();
        randomFourthLane.geometry = randomFourthLane.geometry.clone();
        randomFourthLane.position.set(10, 0, -30);
        randomFourthLane.rotation.y = Math.PI / 2;
        matrix.makeTranslation(40, 0, -40);
        randomFourthLane.geometry.applyMatrix(matrixWorldInverse);
        randomFourthLane.geometry.applyMatrix(matrix);
        randomLanes.push(randomFourthLane);
        var g = THREE.BufferGeometryUtils.mergeBufferGeometries([randomFirstLane.geometry,randomSecondLane.geometry, randomThirdLane.geometry, randomFourthLane.geometry])
        randomFirstLane.geometry = g;
        // 随机获取一个十字路口
        var randomFirstIntersection = getElementByRandom(this.intersections).clone();
        randomFirstIntersection.position.set(-30, 0, 30)
        randomChunkObject3.add(randomFirstIntersection)
        randomLanes.forEach(function(randomLane) {
            // 随即因子，移动设备上设置的小一点，pc设备上设置的大一点，可以有效地优化移动端性能
            var e = window.isMobile ? .2 : .35;
            if (Common.random() < e) {
                // 在随机生成的道路上，随机生成一个车
                var randomFirstCar = getElementByRandom(this.carObjects).clone();
                var tab = new InitCarPoints(this, randomFirstCar, randomLane);
                randomChunkObject3.add(tab);
                this.mobs.push(tab);
            }
        }, this)
        if (Common.random() > .65) {
            var randomFirstCloud = getElementByRandom(this.cloudObjects).clone();
            var b = new Buffer(this, randomFirstCloud);
            randomChunkObject3.add(b);
            this.mobs.push(b);
        }
        return randomChunkObject3.traverse(function(object) {
            if (object instanceof THREE.Mesh && object.material && object.material.pbr) {
                /** @type {boolean} */
                object.material.defines.USE_FOG = true;
                if (object instanceof Buffer == false) {
                    /** @type {boolean} */
                    object.receiveShadow = true;
                    /** @type {boolean} */
                    object.material.defines.USE_SHADOWMAP = true;
                    /** @type {boolean} */
                    object.material.defines[state.SHADOWMAP_TYPE] = true;
                }
            }
        }), randomChunkObject3;
    },
    _generate : function() {
    /** @type {number} */
        var i = 0;
        // 生成一个9x9的格子
        for (; i < state.TABLE_SIZE; i++) {
            /** @type {number} */
            var x = 0;
            for (; x < state.TABLE_SIZE; x++) {
                if (void 0 === this.chunks[x]) {
                    /** @type {!Array} */
                    this.chunks[x] = [];
                }
                // 获取随机的分块，根据当前的坐标
                var node = this._getRandomChunk(x, i);
                /** @type {number} */
                node.tableX = x;
                /** @type {number} */
                node.tableY = i;
                this.chunks[x][i] = {
                    node : node
                };
            }
        }
    }
});

/** @type {function(!Function, !Object, number, ?, ?): undefined} */
export {getNeighboringCarsUpdate};

