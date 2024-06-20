import { Object3D, Mesh, SphereGeometry, MeshBasicMaterial } from '../threejs/three.module.js';

/**
 * Custom tweening library, not in use.
 */
class Tweener {

    tweenObject(object) {
        if (this._objects === undefined) this._objects = []; // checks if this tweener has an object list
        if (this._map === undefined) this._map = new Map();

        // checks if object is a 3D object
        if ( !(object instanceof Object3D) ) throw new Error("object is not of type: THREE.Object3D");

        this._objects.push(object); // adds object to object list
        this._map.set(object,{});
    }

    addChannels(object, ...channels) {

        // checks if this tweener has an object list; if it does, check if it is registered in the tweener
        if(this._objects === undefined || !this._objects.includes(object)) throw new Error("object is not registered - " + object.constructor.name);

        // checks if the registered object has a channel list
        if ( this._map.get(object)._channels === undefined ) this._map.get(object)._channels = new Map();

        // adds channels to object channel-list
        for(let i = 0; i < channels.length; i++) {
            this._map.get(object)._channels.set(channels[i],{});
        }
    }

    setChannel(object, channel, axis, endPos, options) {

        // checks if this tweener has an object list; if it does, check if the requested obj is registered in the tweener
        if(this._objects === undefined || !this._objects.includes(object)) throw new Error("object is not registered - " + object.constructor.name);
        
        // checks if the registered object has a channel list, if it does, check if it has the specified channel
        if(this._map.get(object)._channels === undefined || !(this._map.get(object)._channels.has(channel))) throw new Error(channel.constructor.name + ": channel is not registered ");

        if (options === undefined) {options = {interpolation: "linear", speed: 1}; }
        this._map.get(object)
            ._channels.get(channel)[axis] =
        {
            "endPosition": endPos,
            "interpolation": options.interpolation,
            "speed": options.speed
        };
    }

    nextFrame() { // << adjust to interpolation type
        for (const [object,channelList] of this._map.entries()) {
            if (channelList._channels === undefined) continue;
            for (const [channel, axes] of channelList._channels.entries()) {
                for (const axis in axes) {
                    const properties = axes[axis];
                    if ( Math.abs(properties["endPosition"] - channel[axis]) < 0.1 ){
                        delete axes[axis];
                        continue;
                    }
                    switch (properties["interpolation"]) {
                        case "linear":
                            // find a way to store linear constant and add it to channel
                            break;
                        case "easing":
                            channel[axis] += this.#calculateEasingConstant(channel[axis],properties["endPosition"],properties["speed"]);
                            break;
                    }
                    // channel[axis] += ( properties["endPosition"] - channel[axis] ) * ((properties["speed"]/100)%101);
                }
            }
        }
    }

    #calculateLinearConstant(constant,speed) {
        return constant / Math.min(1,((100-speed)%101));
    }

    #calculateEasingConstant(pos1,pos2,speed) {
        return (pos2-pos1) * ((speed/100)%101);
    }
}

export { Tweener }