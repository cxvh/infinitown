import * as THREE  from 'three';
// 透视相机
var ctor = THREE.PerspectiveCamera;
import TubularModel from 'three-orbit-controls';

/**
 * 透视相机
 * @param data
 * @constructor
 */
var PerspectiveCameraUpdate = function(data) {
    ctor.call(this);
    // 相机面向
    this.aspect = window.innerWidth / window.innerHeight;
    //
    this.fov = 50;
    this.near = 1;
    this.far = 1E3;
    this.updateProjectionMatrix();
    this.controls = new TubularModel(this, data || document.body);
};
PerspectiveCameraUpdate.inherit(ctor, {
    update : function() {
        this.controls.MatcapMaterial();
    }
});

export {PerspectiveCameraUpdate};
