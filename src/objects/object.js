/**
 An **Object** is a 3D element within a xeogl {{#crossLink "Scene"}}Scene{{/crossLink}}.

 ## Overview

 Object is an abstract base class that's subclassed by:

 * {{#crossLink "Mesh"}}{{/crossLink}}, which represents a drawable 3D primitive.
 * {{#crossLink "Group"}}{{/crossLink}}, which is a composite Object that represents a group of child Objects.
 * {{#crossLink "Model"}}{{/crossLink}}, which is a Group and is subclassed by {{#crossLink "GLTFModel"}}{{/crossLink}},
 {{#crossLink "STLModel"}}{{/crossLink}}, {{#crossLink "OBJModel"}}{{/crossLink}} etc. A Model can contain child Groups
 and {{#crossLink "Mesh"}}Meshes{{/crossLink}} that represent its component parts.

 As shown in the examples below, these component types can be connected into flexible scene hierarchies that contain
 content loaded from multiple sources and file formats. Since a {{#crossLink "Group"}}{{/crossLink}} implements the *[Composite](https://en.wikipedia.org/wiki/Composite_pattern)* pattern,
 property updates on a {{#crossLink "Group"}}Group{{/crossLink}} will apply recursively to all the Objects within it.

 This page mostly covers the base functionality provided by Object, while the pages for the subclasses document the
 functionality specific to those subclasses.

 ## Usage

 * [Creating an Object hierarchy](#creating-an-object-hierarchy)
 * [Accessing Objects](#accessing-objects)
 * [Updating Objects](#updating-objects)
 * [Adding and removing Objects](#updating-objects)
 * [Models within Groups](#models-within-groups)
 * [Objects within Models](#objects-within-models)
 * [Applying a semantic data model](#applying-a-semantic-data-model)
 * [Destroying Objects](#destroying-objects)

 ### Creating an Object hierarchy

 Let's create a {{#crossLink "Group"}}Group{{/crossLink}} that represents a table, with five child {{#crossLink "Mesh"}}{{/crossLink}}es for its top and legs:

 <a href="../../examples/#objects_hierarchy"><img src="../../assets/images/screenshots/objectHierarchy.png"></img></a>

 ````javascript
 var boxGeometry = new xeogl.BoxGeometry(); // We'll reuse the same geometry for all our Meshes

 var table = new xeogl.Group({

     id: "table",
     rotation: [0, 50, 0],
     position: [0, 0, 0],
     scale: [1, 1, 1],

     children: [

         new xeogl.Mesh({ // Red table leg
             id: "redLeg",                                  // <<-------- Optional ID within Scene
             guid: "5782d454-9f06-4d71-aff1-78c597eacbfb",  // <<-------- Optional GUID
             position: [-4, -6, -4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1, 0.3, 0.3]
             })
         }),

         new xeogl.Mesh({ // Green table leg
             id: "greenLeg",                                // <<-------- Optional ID within Scene
             guid: "c37e421f-5440-4ce1-9b4c-9bd06d8ab5ed",  // <<-------- Optional GUID
             position: [4, -6, -4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [0.3, 1.0, 0.3]
             })
         }),

         new xeogl.Mesh({// Blue table leg
             id: "blueLeg",
             position: [4, -6, 4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [0.3, 0.3, 1.0]
             })
         }),

         new xeogl.Mesh({  // Yellow table leg
             id: "yellowLeg",
             position: [-4, -6, 4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1.0, 1.0, 0.0]
             })
         })

         new xeogl.Mesh({ // Purple table top
             id: "tableTop",
             position: [0, -3, 0],
             scale: [6, 0.5, 6],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1.0, 0.3, 1.0]
             })
         })
     ]
 });
 ````

 ### Accessing Objects

 We can then get those {{#crossLink "Mesh"}}Mesh{{/crossLink}} Objects by index from the {{#crossLink "Group"}}Group{{/crossLink}}'s children property:

 ````javascript
 var blueLeg = table.children[2];
 blueLeg.highlighted = true;
 ````

 We can also get them by ID from the {{#crossLink "Group"}}Group{{/crossLink}}'s childMap property:

 ````javascript
 var blueLeg = table.childMap["blueLeg"];
 blueLeg.highlighted = true;
 ````

 or by ID from the {{#crossLink "Scene"}}{{/crossLink}}'s components map:

 ````javascript
 var blueLeg = table.scene.components["blueLeg"];
 blueLeg.highlighted = true;
 ````

 or from the {{#crossLink "Scene"}}{{/crossLink}}'s objects map (only Objects are in this map, and {{#crossLink "Mesh"}}Meshes{{/crossLink}} are Objects):

 ````javascript
 var blueLeg = table.scene.objects["blueLeg"];
 blueLeg.highlighted = true;
 ````

 or from the {{#crossLink "Scene"}}{{/crossLink}}'s meshes map (only {{#crossLink "Mesh"}}Meshes{{/crossLink}} are in that map):

 ````javascript
 var blueLeg = table.scene.meshes["blueLeg"];
 blueLeg.highlighted = true;
 ````
 For convenience, the {{#crossLink "Scene"}}{{/crossLink}}'s objects map explicitly registers what Objects exist within the {{#crossLink "Scene"}}{{/crossLink}}, while its meshes map
 explicitly registers what {{#crossLink "Mesh"}}Meshes{{/crossLink}} exist.

 #### GUIDs

 Lastly, note the optional globally unique identifiers (GUIDs) on the first two Objects. While regular IDs are unique within the Scene,
 GUIDs are unique throughout the entire universe, and are often used to identify elements in things like architectural models. We can
 find those Objects within their Scene using their GUIDs, like this:

 ````javascript
 var redLeg = scene.guidObjects["5782d454-9f06-4d71-aff1-78c597eacbfb"];
 var greenLeg = scene.guidObjects["c37e421f-5440-4ce1-9b4c-9bd06d8ab5ed"];
 ````

 ### Updating Objects

 As mentioned earlier, property updates on a {{#crossLink "Group"}}Group{{/crossLink}} {{#crossLink "Object"}}{{/crossLink}} will apply recursively to all
 sub-Objects within it, eventually updating the {{#crossLink "Mesh"}}{{/crossLink}} {{#crossLink "Object"}}Objects{{/crossLink}} at the leaves.

 These properties, defined in Object, are:

 * {{#crossLink "Object/visible:property"}}visible{{/crossLink}}
 * {{#crossLink "Object/highlighted:property"}}highlighted{{/crossLink}}
 * {{#crossLink "Object/ghosted:property"}}ghosted{{/crossLink}}
 * {{#crossLink "Object/selected:property"}}selected{{/crossLink}}
 * {{#crossLink "Object/colorize:property"}}colorize{{/crossLink}}
 * {{#crossLink "Object/opacity:property"}}opacity{{/crossLink}}
 * {{#crossLink "Object/clippable:property"}}clippable{{/crossLink}}
 * {{#crossLink "Object/collidable:property"}}collidable{{/crossLink}}
 * {{#crossLink "Object/pickable:property"}}pickable{{/crossLink}}
 * {{#crossLink "Object/castShadow:property"}}castShadow{{/crossLink}}
 * {{#crossLink "Object/receiveShadow:property"}}receiveShadow{{/crossLink}}
 * {{#crossLink "Object/receiveShadow:property"}}receiveShadow{{/crossLink}}

 Let's highlight the whole table in one shot:

 ````javascript
 table.highlighted = true;
 ````

 That property value will then recursively propagate down our five Meshes.

 Each Object has a local transformation that's applied within the coordinate space set up the
 transform of its parent, if it has one.

 Let's rotate the table:

 ````javascript
 table.rotation = [0, 45, 0]; // (X,Y,Z)
 table.childMap["tableTop"].position = [0, -10, 0]; // (X,Y,Z)
 ````

 That will rotate the coordinate space containing the five child Meshes.

 Now let's translate the table top Mesh:

 ````javascript
 table.childMap["tableTop"].position = [0, -10, 0]; // (X,Y,Z)
 ````

 As we translated table top Mesh, we updated the extents its World-space boundary. That update, in addition to rotating
 the table Group, has updated the collective boundary of the whole table.

 We can get the boundary of the table top like this:

 ````javascript
 var tableTopMesh = table.childMap["tableTop"].aabb;
 ````

 We can get the collective boundary of the whole table, like this:

 ````javascript
 var tableTopMesh = table.aabb;
 ````

 Just for fun, let's fit the view to the table top:

 ````javascript
 var cameraFlight = new xeogl.CameraFlightAnimation(); // Fit the boundary in view
 cameraFlight.flyTo(tableTopMesh.aabb);
 ````

 Those boundaries will automatically update whenever we add or remove child {{#crossLink "Object"}}Objects{{/crossLink}} or {{#crossLink "Mesh"}}Meshes{{/crossLink}}, or update child {{#crossLink "Mesh"}}Meshes{{/crossLink}}' {{#crossLink "Geometry"}}Geometries{{/crossLink}}
 or modeling transforms.

 Let's follow the table top wherever it goes:

 tableTopMesh.on("boundary", function() {
    cameraFlight.flyTo(this.aabb); // "this" is the table top Mesh
 });

 Or perhaps keep the whole table fitted to view whenever we transform any Objects or Meshes within the hierarchy, or add
 or remove Objects within the hierarchy:

 ````javascript
 table.on("boundary", function() {
     var aabb = this.aabb; // "this" is the table Group
     cameraFlight.flyTo(aabb);
 });
 ````

 ### Adding and removing Objects

 Let's add another {{#crossLink "Mesh"}}Mesh{{/crossLink}} to our table {{#crossLink "Group"}}Group{{/crossLink}}, a sort of spherical ornament sitting on the table top:

 ````javascript
 table.addChild(new xeogl.Mesh({
     id: "myExtraObject",
     geometry: new xeogl.SphereGeometry({ radius: 1.0 }),
     position: [2, -3, 0],
     geometry: boxGeometry,
     material: new xeogl.PhongMaterial({
         diffuse: [0.3, 0.3, 1.0]
     })
 });
 ````

 That's going to update the {{#crossLink "Group"}}Group{{/crossLink}}'s boundary, as mentioned earlier.

 To remove it, just destroy it:

 ````javascript
 table.childMap["myExtraObject"].destroy();
 ````

 ### Models within Groups

 Now let's create a {{#crossLink "Group"}}Group{{/crossLink}} that contains three Models. Recall that Models are {{#crossLink "Group"}}Group{{/crossLink}}s, which are Objects.

 <a href="../../examples/#objects_hierarchy_models"><img src="../../assets/images/screenshots/modelHierarchy.png"></img></a>

 ````javascript
 var myModels = new xeogl.Group({

     rotation: [0, 0, 0],
     position: [0, 0, 0],
     scale: [1, 1, 1],

     children: [

         new xeogl.GLTFModel({
             id: "engine",
             src: "models/gltf/2CylinderEngine/glTF/2CylinderEngine.gltf",
             scale: [.2, .2, .2],
             position: [-110, 0, 0],
             rotation: [0, 90, 0],
             objectTree: true // <<----------------- Loads Object tree from glTF scene node graph
         }),

         new xeogl.GLTFModel({
             id: "hoverBike",
             src: "models/gltf/hover_bike/scene.gltf",
             scale: [.5, .5, .5],
             position: [0, -40, 0]
         }),

         new xeogl.STLModel({
             id: "f1Car",
             src: "models/stl/binary/F1Concept.stl",
             smoothNormals: true,
             scale: [3, 3, 3],
             position: [110, -20, 60],
             rotation: [0, 90, 0]
         })
     ]
 });
 ````

 Like with the {{#crossLink "Mesh"}}{{/crossLink}} Objects in the previous example, we can then get those Models by index from the {{#crossLink "Group"}}Group{{/crossLink}}'s children property:

 ````javascript
 var hoverBike = myModels.children[1];
 hoverBike.scale = [0.5, 0.5, 0.5];
 ````

 or by ID from the {{#crossLink "Group"}}Group{{/crossLink}}'s childMap property:

 ````javascript
 var hoverBike = myModels.childMap["hoverBike"];
 hoverBike.scale = [0.5, 0.5, 0.5];
 ````

 or by ID from the {{#crossLink "Scene"}}{{/crossLink}}'s components map:

 ````javascript
 var hoverBike = myModels.scene.components["hoverBike"];
 hoverBike.scale = [0.75, 0.75, 0.75];
 ````

 or from the {{#crossLink "Scene"}}{{/crossLink}}'s objects map (only Objects are in this map, and Models are Objects):

 ````javascript
 var hoverBike = myModels.scene.objects["hoverBike"];
 hoverBike.scale = [0.75, 0.75, 0.75];
 ````

 or from the {{#crossLink "Scene"}}{{/crossLink}}'s models map (which only contains Models):

 ````javascript
 var hoverBike = myModels.scene.models["hoverBike"];
 hoverBike.scale = [0.5, 0.5, 0.5];
 ````

 For convenience, the {{#crossLink "Scene"}}{{/crossLink}}'s objects map explicitly registers what Objects exist within the {{#crossLink "Scene"}}{{/crossLink}}, while its models map
 explicitly registers what Models exist.

 As mentioned earlier, property updates on a {{#crossLink "Group"}}Group{{/crossLink}} will apply recursively to all the Objects within it. Let's highlight
 all the Models in the {{#crossLink "Group"}}Group{{/crossLink}}, in one shot:

 ````javascript
 myModels.highlighted = true;
 ````

 and just for fun, let's scale the {{#crossLink "Group"}}Group{{/crossLink}} down, then rotate one of the Models, relative to the {{#crossLink "Group"}}Group{{/crossLink}}:

 ````javascript
 myModels.scale = [0.5, 0.5, 0.5]; // (X,Y,Z)
 myModels.childMap["engine"].rotation = [0, 45, 0]; // (X,Y,Z)
 ````

 ### Objects within Models

 Notice the ````objectTree```` configuration on the first child {{#crossLink "GLTFModel"}}{{/crossLink}} in the previous
 example. That's going to cause the GLTFModel (which is a {{#crossLink "Group"}}Group{{/crossLink}}) to create one or more subtrees of child Objects from the
 glTF scene node graph. The root Objects of the subtrees will be available in the GLTFModel's {{#crossLink "GLTFModel/children:property"}}{{/crossLink}} and {{#crossLink "GLTFModel/childMap:property"}}{{/crossLink}}
 properties, while all the Objects in the subtrees will be available in the GLTFModel's objects property, and all the {{#crossLink "Mesh"}}{{/crossLink}}es at the
 leaves of the subtrees will be available in the GLTFModel's objects property.


 {{#crossLink "Component/id:property"}}{{/crossLink}}

 TODO:

 ````javascript
 models.childMap["engine"].childMap["engine#0"].highlighted = true;
 ````

 ````javascript
 models.childMap["engine"].objects["engine#3.0"].highlighted=true;
 ````

 ````javascript
 models.childMap["engine"].meshes["engine#3.0"].highlighted=true;
 ````

 ### Applying a semantic data model

 xeogl allows to organize our Objects using a generic conceptual data model that describes the semantics of our application
 domain. We do this by assigning "entity classes" to those Objects that we consider to be *entities* within our domain, and then we're
 able to reference those Objects according to their entity classes.

 #### entityType

 In xeogl, we classify an Object as an entity by setting its {{#crossLink "Object/entityType:property"}}{{/crossLink}} to an arbitrary string
 value that represents its class. Once we've done that, we regard the Object as being an "entity" within our semantic data model, in
 addition to being a regular Object within our scene graph. Note that entities in xeogl are not to be confused with *entity-component systems*,
 which are a completely different concept.

 This classification mechanism is useful for building IFC viewers on xeogl, in which case our entity classes would be the IFC
 element types. However, since xeogl's concept of entity classes is generic, our semantic model could include any arbitrary
 set of classes, such as "fluffy", "insulator", "essential" or "optional", for example.

 This mechanism only goes as far as allowing us to assign entity classes to our Objects, for the purpose of finding them
 within the Scene using their classes. If we wanted to go a step further and model relationships between our classes,
 we would need to additionally use some sort of entity-relationship data structure, externally to xeogl, such as an IFC structure model
 in which the relation elements would reference our classes.

 Objects that are not part of any semantic model, such as helpers and gizmos, would not get an ````entityType````, and so would
 be effectively invisible to maps and methods that deal with specifically with entities. Use component IDs and "lower-level" maps
 like  {{#crossLink "Scene/components:property"}}Scene#components{{/crossLink}},
 {{#crossLink "Scene/objects:property"}}Scene#objects{{/crossLink}},
 {{#crossLink "Scene/meshes:property"}}Scene#meshes{{/crossLink}} and
 {{#crossLink "Scene/models:property"}}Scene#models{{/crossLink}} to work with such Objects as non-semantic scene elements,
 and "higher-level" maps like {{#crossLink "Scene/entities:property"}}Scene#entities{{/crossLink}} and
 {{#crossLink "Scene/entityTypes:property"}}Scene#entityTypes{{/crossLink}} to work with Objects that are entities.

 To show how to use a semantic model with xeogl, let's redefine the Object hierarchy we created earlier, this
 time assigning some imaginary domain-specific entity classes to our table Mesh Objects:

 ````javascript
 var boxGeometry = new xeogl.BoxGeometry(); // We'll reuse the same geometry for all our Meshes

 var table = new xeogl.Group({

     id: "table",
     rotation: [0, 50, 0],
     position: [0, 0, 0],
     scale: [1, 1, 1],

     children: [

         new xeogl.Mesh({ // Red table leg
             id: "redLeg",
             entityType: "supporting",  // <<------------ Entity class
             position: [-4, -6, -4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1, 0.3, 0.3]
             })
         }),

         new xeogl.Mesh({ // Green table leg
             id: "greenLeg",
             entityType: "supporting",  // <<------------ Entity class
             position: [4, -6, -4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [0.3, 1.0, 0.3]
             })
         }),

         new xeogl.Mesh({// Blue table leg
             id: "blueLeg",
             entityType: "supporting",  // <<------------ Entity class
             position: [4, -6, 4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [0.3, 0.3, 1.0]
             })
         }),

         new xeogl.Mesh({  // Yellow table leg
             id: "yellowLeg",
             entityType: "supporting",  // <<------------ Entity class
             position: [-4, -6, 4],
             scale: [1, 3, 1],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1.0, 1.0, 0.0]
             })
         })

         new xeogl.Mesh({ // Purple table top
             id: "tableTop",
             entityType: "surface",     // <<------------ Entity class
             position: [0, -3, 0],
             scale: [6, 0.5, 6],
             rotation: [0, 0, 0],
             geometry: boxGeometry,
             material: new xeogl.PhongMaterial({
                 diffuse: [1.0, 0.3, 1.0]
             })
         })
     ]
 });
 ````

 This time, we've set the {{#crossLink "Object/entityType:property"}}{{/crossLink}} property on our Mesh Objects, to
 assign our entity classes to them. Our arbitrary semantic model is very simple, with just two classes:

 * "supporting" for entities that support things (eg. table legs), and
 * "surface" for entities that provide a surface that you can put things on (eg. table tops).

 Note that we can assign entity classes to any component type that extends Object, including {{#crossLink "Group"}}{{/crossLink}},
 {{#crossLink "Mesh"}}{{/crossLink}}, {{#crossLink "Model"}}{{/crossLink}}, {{#crossLink "GLTFModel"}}{{/crossLink}} etc.

 We can now conveniently work with our Mesh Objects as entities, in addition working with them as ordinary Objects.

 We can find our entities in a dedicated map, that contains only the Objects that have the "entityType" property set:

 ````javascript
 var yellowLegMesh = scene.entities["yellowLeg"];
 ````

 We can get a map of all Objects of a given entity class:

 ````javascript
 var supportingEntities = scene.entityTypes["supporting"];
 var yellowLegMesh = supportingEntities["yellowLeg"];
 ````

 We can do state updates on entity Objects by their entity class, in a batch:

 ````javascript
 scene.setVisible(["supporting"], false);               // Hide the legs
 scene.setVisible(["supporting"], true);                // Show the legs again
 scene.setHighlighted(["supporting", "surface"], true); // Highlight the legs and the table top
 ````

 The {{#crossLink "Scene"}}{{/crossLink}} also has convenience maps dedicated to tracking the visibility, ghosted, highlighted
 and selected states of entity Objects:

 ````javascript
 var yellowLegMesh = scene.visibleEntities["yellowLeg"];
 var isYellowLegVisible = yellowLegMesh !== undefined;

 yellowLegMesh.highlighted = false;
 var isYellowLegHighlighted = scene.highlightedEntities["yellowLeg"];
 ````

 We can also update or remove entity classes dynamically, for example:

 ````javascript
 var tableTop = scene.entities["tableTop"];
 tableTop.entityType = "workSurface";
 ````

 Now our table top Mesh can be found with its new class:

 ````javascript
 var workSurfaceEntities = scene.entityTypes["workSurface"];
 var tableTop = workSurfaceEntities["tableTop"];
 ````

 And we can remove its class altogether:

 ````javascript
 tableTop.entityType = null;
 ````

 That will remove this entity Mesh from the {{#crossLink "Scene"}}Scene{{/crossLink}}'s visibility and
 highlighted maps. Restoring a class will register it with those maps again, since the Mesh is currently visible and highlighted.

 * [Example](../../examples/#objects_entities)

 #### Limitations with state inheritance

 Note that you can't currently nest entity Objects within a hierarchy. If we were to set an entityType on our Group,
 say "furniture", and then do this:

 ````javascript
 scene.setVisible(["furniture"], false);                // Hide the table
 ````

 Then all our entity Meshes would be hidden, even though they are not "furniture" entities. The entity classification
 system does not currently work alongside the way xeogl does state inheritance within Object hierarchies, so keep your
 entities non-hierarchical.

 ### Destroying Objects

 Call an Object's {{#crossLink "Component/destroy:method"}}destroy(){{/crossLink}} method to destroy it:

 ````JavaScript
 myObject.destroy();
 ````

 That will also destroy all Objects in its subtree.

 @class Object
 @module xeogl
 @submodule objects
 @constructor
 @param [scene] {Scene} Parent {{#crossLink "Scene"}}{{/crossLink}}.
 @param [cfg] {*} Configs
 @param [cfg.id] {String} Optional ID, unique among all components in the parent scene, generated automatically when omitted.
 @param [cfg.guid] {String} Optional globally unique identifier. This is unique not only within the {{#crossLink "Scene"}}{{/crossLink}}, but throughout the entire universe.
 @param [cfg.meta] {String:Object} Optional map of user-defined metadata.
 @param [cfg.entityType] {String} Optional entity classification when using within a semantic data model.
 @param [cfg.parent] {Object} The parent.
 @param [cfg.position=[0,0,0]] {Float32Array} Local 3D position.
 @param [cfg.scale=[1,1,1]] {Float32Array} Local scale.
 @param [cfg.rotation=[0,0,0]] {Float32Array} Local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.
 @param [cfg.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1] {Float32Array} Local modelling transform matrix. Overrides the position, scale and rotation parameters.
 @param [cfg.visible=true] {Boolean}        Indicates if visible.
 @param [cfg.culled=false] {Boolean}        Indicates if culled from view.
 @param [cfg.pickable=true] {Boolean}       Indicates if pickable.
 @param [cfg.clippable=true] {Boolean}      Indicates if clippable.
 @param [cfg.collidable=true] {Boolean}     Indicates if included in boundary calculations.
 @param [cfg.castShadow=true] {Boolean}     Indicates if casting shadows.
 @param [cfg.receiveShadow=true] {Boolean}  Indicates if receiving shadows.
 @param [cfg.outlined=false] {Boolean}      Indicates if outline is rendered.
 @param [cfg.ghosted=false] {Boolean}       Indicates if ghosted.
 @param [cfg.highlighted=false] {Boolean}   Indicates if highlighted.
 @param [cfg.selected=false] {Boolean}      Indicates if selected.
 @param [cfg.aabbVisible=false] {Boolean}   Indicates if axis-aligned World-space bounding box is visible.
 @param [cfg.obbVisible=false] {Boolean}    Indicates if oriented World-space bounding box is visible.
 @param [cfg.colorize=[1.0,1.0,1.0]] {Float32Array}  RGB colorize color, multiplies by the rendered fragment colors.
 @param [cfg.opacity=1.0] {Number}          Opacity factor, multiplies by the rendered fragment alpha.
 @param [cfg.children] {Array(Object)}      Children to add. Children must be in the same {{#crossLink "Scene"}}{{/crossLink}} and will be removed from whatever parents they may already have.
 @param [cfg.inheritStates=true] {Boolean}  Indicates if children given to this constructor should inherit state from this parent as they are added. State includes {{#crossLink "Object/visible:property"}}{{/crossLink}}, {{#crossLink "Object/culled:property"}}{{/crossLink}}, {{#crossLink "Object/pickable:property"}}{{/crossLink}},
 {{#crossLink "Object/clippable:property"}}{{/crossLink}}, {{#crossLink "Object/castShadow:property"}}{{/crossLink}}, {{#crossLink "Object/receiveShadow:property"}}{{/crossLink}},
 {{#crossLink "Object/outlined:property"}}{{/crossLink}}, {{#crossLink "Object/ghosted:property"}}{{/crossLink}}, {{#crossLink "Object/highlighted:property"}}{{/crossLink}},
 {{#crossLink "Object/selected:property"}}{{/crossLink}}, {{#crossLink "Object/colorize:property"}}{{/crossLink}} and {{#crossLink "Object/opacity:property"}}{{/crossLink}}.
 @extends Component
 */
xeogl.Object = xeogl.Component.extend({

    /**
     JavaScript class name for this xeogl.Object.

     @property type
     @type String
     @final
     */
    type: "xeogl.Object",

    _init: function (cfg) {

        var math = xeogl.math;

        this._parent = null;
        this._childList = [];
        this._childMap = {};
        this._childIDs = null;

        this._aabb = null;
        this._aabbDirty = true;
        this._obb = null;
        this._obbDirty = true;

        this._scale = math.vec3();
        this._quaternion = math.identityQuaternion();
        this._rotation = math.vec3();
        this._position = math.vec3();

        this._localMatrix = math.identityMat4();
        this._worldMatrix = math.identityMat4();
        this._worldNormalMatrix = math.identityMat4();

        this._localMatrixDirty = true;
        this._worldMatrixDirty = true;
        this._worldNormalMatrixDirty = true;

        this._guid = cfg.guid;
        this.entityType = cfg.entityType;

        if (cfg.matrix) {
            this.matrix = cfg.matrix;

        } else {
            this.scale = cfg.scale;
            this.position = cfg.position;
            if (cfg.quaternion) {
            } else {
                this.rotation = cfg.rotation;
            }
        }

        // Properties

        // If this component instance is a subclass of xeogl.Object that redefines these properties,
        // then it's the subclass's properties that are being set here
        // (eg. as redefined on xeogl.Mesh, xeogl.Model etc)

        this.visible = cfg.visible;
        this.culled = cfg.culled;
        this.pickable = cfg.pickable;
        this.clippable = cfg.clippable;
        this.collidable = cfg.collidable;
        this.castShadow = cfg.castShadow;
        this.receiveShadow = cfg.receiveShadow;
        this.outlined = cfg.outlined;
        this.layer = cfg.layer;
        this.stationary = cfg.stationary;
        this.billboard = cfg.billboard;
        this.solid = cfg.solid;
        this.ghosted = cfg.ghosted;
        this.highlighted = cfg.highlighted;
        this.selected = cfg.selected;
        this.colorize = cfg.colorize;
        this.opacity = cfg.opacity;
        this.aabbVisible = cfg.aabbVisible;
        this.obbVisible = cfg.obbVisible;

        // Add children, which inherit state from this Object

        if (cfg.children) {
            var children = cfg.children;
            for (var i = 0, len = children.length; i < len; i++) {
                this.addChild(children[i], cfg.inheritStates);
            }
        }

        if (cfg.parent) {
            cfg.parent.addChild(this);
        }
    },

    //------------------------------------------------------------------------------------------------------------------
    // Transform management
    //------------------------------------------------------------------------------------------------------------------

    _setLocalMatrixDirty: function () { // Invalidates Local matrix of the Object and invalidates World matrix of child Objects
        this._localMatrixDirty = true;
        this._setWorldMatrixDirty();
    },

    _setWorldMatrixDirty: function () { // Invalidates World matrix of the Object and child Objects
        this._worldMatrixDirty = true;
        this._worldNormalMatrixDirty = true;
        this._aabbDirty = true;
        this._obbDirty = true;
        if (this._childList) {
            for (var i = 0, len = this._childList.length; i < len; i++) {
                this._childList[i]._setWorldMatrixDirty();
            }
        }
    },

    _buildLocalMatrix: function () { // Rebuilds and validates the Object's Local matrix
        xeogl.math.composeMat4(this._position, this._quaternion, this._scale, this._localMatrix);
        this._localMatrixDirty = false;
    },

    _buildWorldMatrix: function () { // Rebuilds and validates Local matrix of the Object, then rebuilds and validates World matrices of the Object and parent Objects
        if (this._localMatrixDirty) {
            this._buildLocalMatrix();
        }
        if (!this._parent) {
            for (var i = 0, len = this._localMatrix.length; i < len; i++) {
                this._worldMatrix[i] = this._localMatrix[i];
            }
        } else {
            xeogl.math.mulMat4(this._parent.worldMatrix, this._localMatrix, this._worldMatrix);
            //  xeogl.math.mulMat4(this._localMatrix, this._parent.worldMatrix, this._worldMatrix);
        }
        this._worldMatrixDirty = false;
    },

    _buildWorldNormalMatrix: function () { // Rebuilds and validates World matrix of the Object, then builds and revalidates World normal matrix of the Object
        if (this._worldMatrixDirty) {
            this._buildWorldMatrix();
        }
        if (!this._worldNormalMatrix) {
            this._worldNormalMatrix = xeogl.math.mat4();
        }
        xeogl.math.inverseMat4(this._worldMatrix, this._worldNormalMatrix);
        xeogl.math.transposeMat4(this._worldNormalMatrix);
        this._worldNormalMatrixDirty = false;
    },

    //------------------------------------------------------------------------------------------------------------------
    // Boundary methods
    //------------------------------------------------------------------------------------------------------------------

    _setBoundaryDirty: (function () {

        var notifications = [];
        var lenNotifications = 0;

        function setParentBoundariesDirty(object) {
            for (; object; object = object._parent) {
                if (object._aabbDirty) {
                    object._aabbDirty = true;
                    object._obbDirty = true;
                    notifications[lenNotifications++] = object;
                }
            }
        }

        function setSubtreeBoundariesDirty(object) {
            if (object._childList) {
                for (var i = 0, len = object._childList.length; i < len; i++) {
                    setSubtreeBoundariesDirty(object._childList[i]);
                }
            }
            if (object._aabbDirty) {
                object._aabbDirty = true;
                object._obbDirty = true;
                notifications[lenNotifications++] = object;
            }
        }

        return function () { // Invalidates AABB and OBB boundaries of the Object and parent Objects
            lenNotifications = 0;
            setSubtreeBoundariesDirty(this);
            setParentBoundariesDirty(this);
            for (var i = 0; i < lenNotifications; i++) {
                notifications[i].fire("boundary");
            }
        };
    })(),


    _updateAABB: function () {
        if (!this._aabb) {
            this._aabb = xeogl.math.AABB3();
            this._aabbDirty = true;
        }
        if (this._aabbDirty) {
            xeogl.math.collapseAABB3(this._aabb);
            for (var i = 0, len = this._childList.length; i < len; i++) {
                xeogl.math.expandAABB3(this._aabb, this._childList[i].aabb);
            }
            if (!this._aabbCenter) {
                this._aabbCenter = new Float32Array(3);
            }
            xeogl.math.getAABB3Center(this._aabb, this._aabbCenter);
            this._aabbDirty = false;
        }
    },

    _updateOBB: function () {
        if (!this._obb) {
            this._obb = xeogl.math.OBB3();
            this._obbDirty = true;
        }
        if (this._obbDirty) {
            if (this._childList.length === 1) {
                this._obb.set(this._childList[0].obb);
            } else {
                xeogl.math.AABB3ToOBB3(this.aabb, this._obb);
            }
            this._obbDirty = false;
        }
    },

    //------------------------------------------------------------------------------------------------------------------
    // Child management methods
    //------------------------------------------------------------------------------------------------------------------

    /**
     Adds a child.

     The child must be in the same {{#crossLink "Scene"}}{{/crossLink}}.

     If the child already has a parent, will be removed from that parent first.

     Does nothing if already a child.

     @param {Object|String} object Instance or ID of the child to add.
     @param [inheritStates=true] Indicates if the child should inherit state from this parent as it is added. State includes
     {{#crossLink "Object/visible:property"}}{{/crossLink}}, {{#crossLink "Object/culled:property"}}{{/crossLink}}, {{#crossLink "Object/pickable:property"}}{{/crossLink}},
     {{#crossLink "Object/clippable:property"}}{{/crossLink}}, {{#crossLink "Object/castShadow:property"}}{{/crossLink}}, {{#crossLink "Object/receiveShadow:property"}}{{/crossLink}},
     {{#crossLink "Object/outlined:property"}}{{/crossLink}}, {{#crossLink "Object/ghosted:property"}}{{/crossLink}}, {{#crossLink "Object/highlighted:property"}}{{/crossLink}},
     {{#crossLink "Object/selected:property"}}{{/crossLink}}, {{#crossLink "Object/colorize:property"}}{{/crossLink}} and {{#crossLink "Object/opacity:property"}}{{/crossLink}}.
     @returns {Object} The child object.
     */
    addChild: function (object, inheritStates) {
        if (xeogl._isNumeric(object) || xeogl._isString(object)) {
            var objectId = object;
            object = this.scene.objects[objectId];
            if (!object) {
                this.warn("Object not found: " + xeogl._inQuotes(objectId));
                return;
            }
        } else if (xeogl._isObject(object)) {
            var cfg = object;
            // object = new xeogl.Group(this.scene, cfg);
            if (!object) {
                return;
            }
        } else {
            if (!object.isType("xeogl.Object")) {
                this.error("Not a xeogl.Object: " + object.id);
                return;
            }
            if (object._parent) {
                if (object._parent.id === this.id) {
                    this.warn("Already a child object: " + object.id);
                    return;
                }
                object._parent.removeChild(object);
            }
        }
        var id = object.id;
        if (object.scene.id !== this.scene.id) {
            this.error("Object not in same Scene: " + id);
            return;
        }
        delete this.scene.rootObjects[id];
        this._childList.push(object);
        this._childMap[id] = object;
        this._childIDs = null;
        object._parent = this;
        if (inheritStates !== false) {
            object.visible = this.visible;
            object.culled = this.culled;
            object.ghosted = this.ghosted;
            object.highlited = this.highlighted;
            object.selected = this.selected;
            object.outlined = this.outlined;
            object.clippable = this.clippable;
            object.pickable = this.pickable;
            object.collidable = this.collidable;
            object.castShadow = this.castShadow;
            object.receiveShadow = this.receiveShadow;
            object.colorize = this.colorize;
            object.opacity = this.opacity;
        }
        object._setWorldMatrixDirty();
        object._setBoundaryDirty(); // Propagates up to this as parent
        return object;
    },

    /**
     Removes the given child.

     @method removeChild
     @param {Object} object Child to remove.
     */
    removeChild: function (object) {
        var id = object.id;
        for (var i = 0, len = this._childList.length; i < len; i++) {
            if (this._childList[i].id === id) {
                object._parent = null;
                this._childList = this._childList.splice(i, 1);
                delete this._childMap[id];
                this._childIDs = null;
                this.scene.rootObjects[object.id] = object;
                object._setWorldMatrixDirty();
                object._setBoundaryDirty();
                this._setBoundaryDirty();
                return;
            }
        }
    },

    /**
     Removes all children.

     @method removeChildren
     */
    removeChildren: function () {
        var object;
        for (var i = 0, len = this._childList.length; i < len; i++) {
            object = this._childList[i];
            object._parent = null;
            this.scene.rootObjects[object.id] = object;
            object._setWorldMatrixDirty();
            object._setBoundaryDirty();
        }
        this._childList = [];
        this._childMap = {};
        this._childIDs = null;
        this._setBoundaryDirty();
    },

    /**
     Rotates about the given local axis by the given increment.

     @method rotate
     @paream {Float32Array} axis Local axis about which to rotate.
     @param {Number} angle Angle increment in degrees.
     */
    rotate: (function () {
        var angleAxis = new Float32Array(4);
        var q1 = new Float32Array(4);
        var q2 = new Float32Array(4);
        return function rotateOnWorldAxis(axis, angle) {
            angleAxis[0] = axis[0];
            angleAxis[1] = axis[1];
            angleAxis[2] = axis[2];
            angleAxis[3] = angle * xeogl.math.DEGTORAD;
            xeogl.math.angleAxisToQuaternion(angleAxis, q1);
            xeogl.math.mulQuaternions(this.quaternion, q1, q2);
            this.quaternion = q2;
            this._setLocalMatrixDirty();
            this._setBoundaryDirty();
            this._renderer.imageDirty();
            return this;
        };
    })(),

    /**
     Rotates about the given World-space axis by the given increment.

     @method rotate
     @paream {Float32Array} axis Local axis about which to rotate.
     @param {Number} angle Angle increment in degrees.
     */
    rotateOnWorldAxis: (function () {
        var angleAxis = new Float32Array(4);
        var q1 = new Float32Array(4);
        return function rotateOnWorldAxis(axis, angle) {
            angleAxis[0] = axis[0];
            angleAxis[1] = axis[1];
            angleAxis[2] = axis[2];
            angleAxis[3] = angle * xeogl.math.DEGTORAD;
            xeogl.math.angleAxisToQuaternion(angleAxis, q1);
            xeogl.math.mulQuaternions(q1, this.quaternion, q1);
            //this.quaternion.premultiply(q1);
            return this;
        };
    })(),

    /**
     Rotates about the local X-axis by the given increment.

     @method rotateX
     @param {Number} angle Angle increment in degrees.
     */
    rotateX: (function () {
        var axis = new Float32Array([1, 0, 0]);
        return function rotateX(angle) {
            return this.rotate(axis, angle);
        };
    })(),

    /**
     Rotates about the local Y-axis by the given increment.

     @method rotateY
     @param {Number} angle Angle increment in degrees.
     */
    rotateY: (function () {
        var axis = new Float32Array([0, 1, 0]);
        return function rotateY(angle) {
            return this.rotate(axis, angle);
        };
    })(),

    /**
     Rotates about the local Z-axis by the given increment.

     @method rotateZ
     @param {Number} angle Angle increment in degrees.
     */
    rotateZ: (function () {
        var axis = new Float32Array([0, 0, 1]);
        return function rotateZ(angle) {
            return this.rotate(axis, angle);
        };
    })(),

    /**
     Translates in local by the given increment.

     @method translate
     @param {Float32Array} axis Normalized local space 3D vector along which to translate.
     @param {Number} distance Distance to translate along  the vector.
     */
    translate: (function () {
        var veca = new Float32Array(3);
        var vecb = new Float32Array(3);
        return function (axis, distance) {
            xeogl.math.vec3ApplyQuaternion(this.quaternion, axis, veca);
            xeogl.math.mulVec3Scalar(veca, distance, vecb);
            xeogl.math.addVec3(this.position, vecb, this.position);
            this._setLocalMatrixDirty();
            this._setBoundaryDirty();
            this._renderer.imageDirty();
            return this;
        };
    })(),

    /**
     Translates along the local X-axis by the given increment.

     @method translateX
     @param {Number} distance Distance to translate along  the X-axis.
     */
    translateX: (function () {
        var v1 = new Float32Array([1, 0, 0]);
        return function translateX(distance) {
            return this.translate(v1, distance);
        };
    })(),

    /**
     * Translates along the local Y-axis by the given increment.
     *
     * @method translateX
     * @param {Number} distance Distance to translate along  the Y-axis.
     */
    translateY: (function () {
        var v1 = new Float32Array([0, 1, 0]);
        return function translateY(distance) {
            return this.translate(v1, distance);
        };
    })(),

    /**
     Translates along the local Z-axis by the given increment.

     @method translateX
     @param {Number} distance Distance to translate along  the Z-axis.
     */
    translateZ: (function () {
        var v1 = new Float32Array([0, 0, 1]);
        return function translateZ(distance) {
            return this.translate(v1, distance);
        };
    })(),

    _props: {

        /**
         Globally unique identifier.

         This is unique not only within the {{#crossLink "Scene"}}{{/crossLink}}, but throughout the entire universe.

         Only defined when given to the constructor.

         @property guid
         @type String
         @final
         */
        guid: {
            get: function () {
                return this._guid;
            }
        },

        /**
         Optional entity classification when using within a semantic data model.

         See the Object documentation on "Applying a semantic data model" for usage.

         @property entityType
         @default null
         @type String
         */
        entityType: {
            set: function (newEntityType) {
                if (this._entityType !== newEntityType) {
                    var scene = this.scene;
                    if (this._entityType) {
                        scene._entityTypeRemoved(this, this._entityType);
                    }
                    this._entityType = newEntityType;
                    if (newEntityType) {
                        scene._entityTypeAssigned(this, this._entityType);
                        if (this._visible) {
                            scene._entityVisibilityUpdated(this, true);
                        }
                        if (this._ghosted) {
                            scene._entityGhostedUpdated(this, true);
                        }
                        if (this._selected) {
                            scene._entitySelectedUpdated(this, true);
                        }
                        if (this._highlighted) {
                            scene._entityHighlightedUpdated(this, true);
                        }
                    } else {
                        scene._entityVisibilityUpdated(this, false);
                        scene._entityGhostedUpdated(this, false);
                        scene._entitySelectedUpdated(this, false);
                        scene._entityHighlightedUpdated(this, false);
                    }
                }
            },
            get: function () {
                return this._entityType;
            }
        },

        //------------------------------------------------------------------------------------------------------------------
        // Children and parent properties
        //------------------------------------------------------------------------------------------------------------------

        /**
         Number of child {{#crossLink "Object"}}Objects{{/crossLink}}.

         @property numChildren
         @final
         @type Number
         */
        numChildren: {
            get: function () {
                return this._childList.length;
            }
        },

        /**
         Array of child {{#crossLink "Object"}}Objects{{/crossLink}}.

         @property children
         @final
         @type Array
         */
        children: {
            get: function () {
                return this._childList;
            }
        },

        /**
         Child {{#crossLink "Object"}}Objects{{/crossLink}} mapped to their IDs.

         @property childMap
         @final
         @type {*}
         */
        childMap: {
            get: function () {
                return this._childMap;
            }
        },

        /**
         IDs of child {{#crossLink "Object"}}Objects{{/crossLink}}.

         @property childIDs
         @final
         @type Array
         */
        childIDs: {
            get: function () {
                if (!this._childIDs) {
                    this._childIDs = Object.keys(this._childMap);
                }
                return this._childIDs;
            }
        },

        /**
         The parent.

         The parent Group may also be set by passing the Object to the
         Group/Model's {{#crossLink "Group/addChild:method"}}addChild(){{/crossLink}} method.

         @property parent
         @type Group
         */
        parent: {
            set: function (object) {
                if (xeogl._isNumeric(object) || xeogl._isString(object)) {
                    var objectId = object;
                    object = this.scene.objects[objectId];
                    if (!object) {
                        this.warn("Group not found: " + xeogl._inQuotes(objectId));
                        return;
                    }
                }
                if (object.scene.id !== this.scene.id) {
                    this.error("Group not in same Scene: " + object.id);
                    return;
                }
                if (this._parent && this._parent.id === object.id) {
                    this.warn("Already a child of Group: " + object.id);
                    return;
                }
                object.addChild(this);
            },
            get: function () {
                return this._parent;
            }
        },

        //------------------------------------------------------------------------------------------------------------------
        // Transform properties
        //------------------------------------------------------------------------------------------------------------------

        /**
         Local translation.

         @property position
         @default [0,0,0]
         @type {Float32Array}
         */
        position: {
            set: function (value) {
                this._position.set(value || [0, 0, 0]);
                this._setLocalMatrixDirty();
                this._setBoundaryDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._position;
            }
        },

        /**
         Local rotation, as Euler angles given in degrees, for each of the X, Y and Z axis.

         @property rotation
         @default [0,0,0]
         @type {Float32Array}
         */
        rotation: {
            set: function (value) {
                this._rotation.set(value || [0, 0, 0]);
                xeogl.math.eulerToQuaternion(this._rotation, "XYZ", this._quaternion);
                this._setLocalMatrixDirty();
                this._setBoundaryDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._rotation;
            }
        },

        /**
         Local rotation quaternion.

         @property quaternion
         @default [0,0,0, 1]
         @type {Float32Array}
         */
        quaternion: {
            set: function (value) {
                this._quaternion.set(value || [0, 0, 0, 1]);
                xeogl.math.quaternionToEuler(this._quaternion, "XYZ", this._rotation);
                this._setLocalMatrixDirty();
                this._setBoundaryDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._quaternion;
            }
        },

        /**
         Local scale.

         @property scale
         @default [0,0,0]
         @type {Float32Array}
         */
        scale: {
            set: function (value) {
                this._scale.set(value || [1, 1, 1]);
                this._setLocalMatrixDirty();
                this._setBoundaryDirty();
                this._renderer.imageDirty();
            },
            get: function () {
                return this._scale;
            }
        },

        /**
         * Local matrix.
         *
         * @property matrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */
        matrix: {
            set: (function () {
                var identityMat = xeogl.math.identityMat4();
                return function (value) {
                    this._localMatrix.set(value || identityMat);
                    xeogl.math.decomposeMat4(this._localMatrix, this._position, this._quaternion, this._scale);
                    this._localMatrixDirty = false;
                    this._setWorldMatrixDirty();
                    this._setBoundaryDirty();
                    this._renderer.imageDirty();
                };
            })(),
            get: function () {
                if (this._localMatrixDirty) {
                    this._buildLocalMatrix();
                }
                return this._localMatrix;
            }
        },

        /**
         * The World matrix.
         *
         * @property worldMatrix
         * @type {Float32Array}
         */
        worldMatrix: {
            get: function () {
                if (this._worldMatrixDirty) {
                    this._buildWorldMatrix();
                }
                return this._worldMatrix;
            }
        },

        /**
         * This World normal matrix.
         *
         * @property worldNormalMatrix
         * @default [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
         * @type {Float32Array}
         */
        worldNormalMatrix: {
            get: function () {
                if (this._worldNormalMatrixDirty) {
                    this._buildWorldNormalMatrix();
                }
                return this._worldNormalMatrix;
            }
        },

        // worldPosition: {
        //     get: function (optionalTarget) {
        //         var result = optionalTarget || new Vector3();
        //         this.updateMatrixWorld(true);
        //         return result.setFromMatrixPosition(this.matrixWorld);
        //     }
        // },
        //
        // worldQuaternion: {
        //     get: function () {
        //         var position = new Vector3();
        //         var scale = new Vector3();
        //         return function getWorldQuaternion(optionalTarget) {
        //             var result = optionalTarget || new Quaternion();
        //             this.updateMatrixWorld(true);
        //             this.matrixWorld.decompose(position, result, scale);
        //             return result;
        //         };
        //     }()
        // },
        //
        // worldRotation: {
        //     get: function () {
        //         var quaternion = new Quaternion();
        //         return function getWorldRotation(optionalTarget) {
        //             var result = optionalTarget || new Euler();
        //             this.getWorldQuaternion(quaternion);
        //             return result.setFromQuaternion(quaternion, this.rotation.order, false)
        //         };
        //     }
        // }(),
        //
        // worldScale: {
        //     get: (function () {
        //         var position = new Float32Array(3);
        //         var quaternion = new Float32Array(4);
        //         return function getWorldScale(optionalTarget) {
        //             var result = optionalTarget || new Float32Array(3);
        //             xeogl.math.decomposeMat4(this.worldMatrix, position, quaternion, result);
        //             return result;
        //         };
        //     })()
        // },
        //
        // worldDirection: {
        //     get: (function () {
        //         var quaternion = new Quaternion();
        //         return function getWorldDirection(optionalTarget) {
        //             var result = optionalTarget || new Vector3();
        //             this.getWorldQuaternion(quaternion);
        //             return result.set(0, 0, 1).applyQuaternion(quaternion);
        //         };
        //     })()
        // },

        //------------------------------------------------------------------------------------------------------------------
        // Boundary properties
        //------------------------------------------------------------------------------------------------------------------

        /**
         World-space 3D axis-aligned bounding box (AABB).

         Represented by a six-element Float32Array containing the min/max extents of the
         axis-aligned volume, ie. ````[xmin, ymin,zmin,xmax,ymax, zmax]````.

         @property aabb
         @final
         @type {Float32Array}
         */
        aabb: {
            get: function () {
                if (this._aabbDirty) {
                    this._updateAABB();  // Could be xeogl.Mesh._updateAABB()
                }
                return this._aabb;
            }
        },

        /**
         World-space 3D oriented bounding box (OBB).

         Represented by a 32-element Float32Array containing the eight vertices of the box,
         where each vertex is a homogeneous coordinate having [x,y,z,w] elements.

         @property obb
         @final
         @type {Float32Array}
         */
        obb: {
            get: function () {
                if (this._obbDirty) {
                    this._updateOBB(); // Could be xeogl.Mesh._updateAABB()
                }
                return this._obb;
            }
        },

        /**
         World-space 3D center.

         @property center
         @final
         @type {Float32Array}
         */
        center: {
            get: function () {
                if (this._aabbDirty) {
                    this._updateAABB();
                }
                return this._aabbCenter;
            }
        },

        /**
         Indicates if visible.

         Only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
         {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

         Each visible Object is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
         {{#crossLink "Scene/visibleEntities:property"}}{{/crossLink}} map while its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
         is set to a value.

         @property visible
         @default true
         @type Boolean
         */
        visible: {
            set: function (visible) {
                visible = visible !== false;
                this._visible = visible;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].visible = visible;
                }
                if (this._entityType) {
                    this.scene._entityVisibilityUpdated(this, visible);
                }
            },
            get: function () {
                return this._visible;
            }
        },

        /**
         Indicates if highlighted.

         Each highlighted Object is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
         {{#crossLink "Scene/highlightedEntities:property"}}{{/crossLink}} map while its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
         is set to a value.

         @property highlighted
         @default false
         @type Boolean
         */
        highlighted: {
            set: function (highlighted) {
                highlighted = !!highlighted;
                this._highlighted = highlighted;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].highlighted = highlighted;
                }
                if (this._entityType) {
                    this.scene._entityHighlightedUpdated(this, highlighted);
                }
            },
            get: function () {
                return this._highlighted;
            }
        },

        /**
         Indicates if ghosted.

         Each ghosted Object is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
         {{#crossLink "Scene/ghostedEntities:property"}}{{/crossLink}} map while its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
         is set to a value.

         @property ghosted
         @default false
         @type Boolean
         */
        ghosted: {
            set: function (ghosted) {
                ghosted = !!ghosted;
                this._ghosted = ghosted;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].ghosted = ghosted;
                }
                if (this._entityType) {
                    this.scene._entityGhostedUpdated(this, ghosted);
                }
            },
            get: function () {
                return this._ghosted;
            }
        },

        /**
         Indicates if selected.

         Each selected Object is registered in its {{#crossLink "Scene"}}{{/crossLink}}'s
         {{#crossLink "Scene/selectedEntities:property"}}{{/crossLink}} map while its {{#crossLink "Object/entityType:property"}}{{/crossLink}}
         is set to a value.

         @property selected
         @default false
         @type Boolean
         */
        selected: {
            set: function (selected) {
                selected = !!selected;
                this._selected = selected;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].selected = selected;
                }
                if (this._entityType) {
                    this.scene._entitySelectedUpdated(this, selected);
                }
            },
            get: function () {
                return this._selected;
            }
        },

        /**
         Indicates if culled from view.

         Only rendered when {{#crossLink "Object/visible:property"}}{{/crossLink}} is true and
         {{#crossLink "Object/culled:property"}}{{/crossLink}} is false.

         @property culled
         @default false
         @type Boolean
         */
        culled: {
            set: function (culled) {
                culled = !!culled;
                this._culled = culled;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].culled = culled;
                }
            },
            get: function () {
                return this._culled;
            }
        },

        /**
         Indicates if clippable.

         Clipping is done by the {{#crossLink "Scene"}}Scene{{/crossLink}}'s {{#crossLink "Clips"}}{{/crossLink}} component.

         @property clippable
         @default true
         @type Boolean
         */
        clippable: {
            set: function (clippable) {
                clippable = clippable !== false;
                this._clippable = clippable;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].clippable = clippable;
                }
            },
            get: function () {
                return this._clippable;
            }
        },

        /**
         Indicates if included in boundary calculations.

         @property collidable
         @default true
         @type Boolean
         */
        collidable: {
            set: function (collidable) {
                collidable = collidable !== false;
                this._collidable = collidable;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].collidable = collidable;
                }
            },
            get: function () {
                return this._collidable;
            }
        },

        /**
         Whether or not to allow picking.

         Picking is done via calls to {{#crossLink "Scene/pick:method"}}Scene#pick(){{/crossLink}}.

         @property pickable
         @default true
         @type Boolean
         */
        pickable: {
            set: function (pickable) {
                pickable = pickable !== false;
                this._pickable = pickable;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].pickable = pickable;
                }
            },
            get: function () {
                return this._pickable;
            }
        },

        /**
         RGB colorize color, multiplies by the rendered fragment color.

         @property colorize
         @default [1.0, 1.0, 1.0]
         @type Float32Array
         */
        colorize: {
            set: function (rgb) {
                var colorize = this._colorize;
                if (!colorize) {
                    colorize = this._colorize = new Float32Array(4);
                    colorize[3] = 1.0;
                }
                if (rgb) {
                    colorize[0] = rgb[0];
                    colorize[1] = rgb[1];
                    colorize[2] = rgb[2];
                } else {
                    colorize[0] = 1;
                    colorize[1] = 1;
                    colorize[2] = 1;
                }
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].colorize = colorize;
                }
            },
            get: function () {
                return this._colorize.slice(0, 3);
            }
        },

        /**
         Opacity factor, multiplies by the rendered fragment alpha.

         This is a factor in range ````[0..1]````.

         @property opacity
         @default 1.0
         @type Number
         */
        opacity: {
            set: function (opacity) {
                var colorize = this._colorize;
                if (!colorize) {
                    colorize = this._colorize = new Float32Array(4);
                    colorize[0] = 1;
                    colorize[1] = 1;
                    colorize[2] = 1;
                }
                colorize[3] = opacity !== null && opacity !== undefined ? opacity : 1.0;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].opacity = opacity;
                }
            },
            get: function () {
                return this._colorize[3];
            }
        },

        /**
         Indicates if outlined.

         @property outlined
         @default false
         @type Boolean
         */
        outlined: {
            set: function (outlined) {
                outlined = !!outlined;
                this._outlined = outlined;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].outlined = outlined;
                }
            },
            get: function () {
                return this._outlined;
            }
        },

        /**
         Indicates if casting shadows.

         @property castShadow
         @default true
         @type Boolean
         */
        castShadow: {
            set: function (castShadow) {
                castShadow = !!castShadow;
                this._castShadow = castShadow;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].castShadow = castShadow;
                }
            },
            get: function () {
                return this._castShadow;
            }
        },

        /**
         Indicates if receiving shadows.

         @property receiveShadow
         @default true
         @type Boolean
         */
        receiveShadow: {
            set: function (receiveShadow) {
                receiveShadow = !!receiveShadow;
                this._receiveShadow = receiveShadow;
                for (var i = 0, len = this._childList.length; i < len; i++) {
                    this._childList[i].receiveShadow = receiveShadow;
                }
            },
            get: function () {
                return this._receiveShadow;
            }
        },

        /**
         Indicates if the 3D World-space axis-aligned bounding box (AABB) is visible.

         @property aabbVisible
         @default false
         @type {Boolean}
         */
        aabbVisible: {
            set: function (show) {
                if (!show && !this._aabbHelper) {
                    return;
                }
                if (!this._aabbHelper) {
                    this._aabbHelper = new xeogl.Mesh(this, {
                        geometry: new xeogl.AABBGeometry(this, {
                            target: this
                        }),
                        material: new xeogl.PhongMaterial(this, {
                            diffuse: [0.5, 1.0, 0.5],
                            emissive: [0.5, 1.0, 0.5],
                            lineWidth: 2
                        })
                    });
                }
                this._aabbHelper.visible = show;
            },
            get: function () {
                return this._aabbHelper ? this._aabbHelper.visible : false;
            }
        },

        /**
         Indicates if the World-space 3D object-aligned bounding box (OBB) is visible.

         @property obbVisible
         @default false
         @type {Boolean}
         */
        obbVisible: {
            set: function (show) {
                if (!show && !this._obbHelper) {
                    return;
                }
                if (!this._obbHelper) {
                    this._obbHelper = new xeogl.Mesh(this, {
                        geometry: new xeogl.OBBGeometry(this, {
                            target: this
                        }),
                        material: new xeogl.PhongMaterial(this, {
                            diffuse: [0.5, 1.0, 0.5],
                            emissive: [0.5, 1.0, 0.5],
                            lineWidth: 2
                        })
                    });
                }
                this._obbHelper.visible = show;
            },
            get: function () {
                return this._obbHelper ? this._obbHelper.visible : false;
            }
        }
    },

    _destroy: function () {
        this._super();
        this.removeChildren();
        if (this._parent) {
            this._parent.removeChild(this);
        }
        if (this._entityType) {
            var scene = this.scene;
            var id = this.id;
            var objectsOfType = scene.entityTypes[this._entityType];
            if (objectsOfType) {
                delete objectsOfType[id];
                // TODO remove submap if now empty
            }
            if (this._entityType) {
                scene._entityTypeRemoved(this, this._entityType);
                if (this._visible) {
                    scene._entityVisibilityUpdated(this, false);
                }
                if (this._ghosted) {
                    scene._entityGhostedUpdated(this, false);
                }
                if (this._selected) {
                    scene._entitySelectedUpdated(this, false);
                }
                if (this._highlighted) {
                    scene._entityHighlightedUpdated(this, false);
                }
            }
        }
    }
});