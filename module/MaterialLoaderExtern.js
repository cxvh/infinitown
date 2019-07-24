import * as THREE  from 'three';
import 'module/ShaderMaterialExtern'
import PBRMaterial from 'module/PBRMaterial';
import images from 'module/update';
import 'module/LoaderUtils'
// 获取MateriaLoader的原型用于扩展
var RandomBaseTimeSeriesDataModel = THREE.MaterialLoader.prototype.parse;
var shaders = null;
// 重写设置顶点的资源
THREE.MaterialLoader.setShaders = function(inShaders) {
    shaders = inShaders;
};

THREE.MaterialLoader.prototype.parse = function(options) {
    var col = options.color;
    options.color = undefined;
    var json = RandomBaseTimeSeriesDataModel.call(this, options);
    options.color = col;
    if (options.customType && 'MatcapMaterial' === options.customType) {
        return images.create({
            uuid : options.uuid,
            name : options.name,
            normalMap : json.normalMap,
            matcapMap : THREE.TextureLoader.load('textures/matcap.jpg'),
            normalMapFactor : 1
        });
    }
    // PBR材料
    if (options.customType && 'PBRMaterial' === options.customType) {
        var metalGlossMap = options.metalGlossMap ? this.getTexture(options.metalGlossMap) : null;
        var albedoMap2 = options.map2 ? this.getTexture(options.map2) : null;
        var normalMap2 = options.normalMap2 ? this.getTexture(options.normalMap2) : null;
        var aoMap2 = options.aoMap2 ? this.getTexture(options.aoMap2) : null;
        var lightMapM = options.lightMapM ? this.getTexture(options.lightMapM) : null;
        var lightMapDir = options.lightMapDir ? this.getTexture(options.lightMapDir) : null;
        var materialEmissiveMapRow = options.emissiveMap ? this.getTexture(options.emissiveMap) : null;
        var packedMap = options.packedPBRMap ? this.getTexture(options.packedPBRMap) : null;
        return PBRMaterial.create({
            vertexShader : shaders['pbr.vs'],
            fragmentShader : shaders['pbr.fs'],
            uuid : options.uuid,
            name : options.name,
            color : options.color,
            opacity : json.opacity,
            transparent : json.transparent,
            alphaTest : json.alphaTest,
            environment : options.environment,
            exposure : options.exposure,
            albedoMap : json.map,
            albedoMap2 : albedoMap2,
            metalGlossMap : metalGlossMap,
            packedMap : packedMap,
            metalFactor : options.metalFactor,
            glossFactor : options.glossFactor,
            normalMapFactor : options.normalFactor,
            normalMap : json.normalMap,
            normalMap2 : normalMap2,
            lightMap : json.lightMap,
            lightMapM : lightMapM,
            lightMapDir : lightMapDir,
            aoMap : json.aoMap,
            aoMap2 : aoMap2,
            aoFactor : options.aoFactor,
            occludeSpecular : options.occludeSpecular,
            emissiveMap : materialEmissiveMapRow
        });
    }
    if ('SkyboxMaterial' === options.customType) {
        var shader = THREE.ShaderLib.cube;
        json.vertexShader = shaders['skybox.vs'];
        json.fragmentShader = shaders['skybox.fs'];
        json.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        json.uniforms.tCube.value = this.getTexture(options.cubemap);
    }
    return json;
};
