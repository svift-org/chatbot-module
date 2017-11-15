/*

The chatbot module should only manage the GUI, not the underlying logic, similar to the VIEW Component in an MVC setup
Doing so, we can release this as a standalone library, which can be used to build generic chatbots for future projects!

*/

var chatbot = (function (container) {
  
  var module = {};

  module.container = container;
  module.config = null;
  module.bubbles = [];
  module.ID = 0;
  module.keys = {};
  module.types = {};
  module.scroll = container.append('div').attr('id', 'cb-flow');
  module.flow = module.scroll.append('div').attr('class', 'cb-inner');
  module.input = container.append('div').attr('id', 'cb-input').style('display', 'none');
  module.input.append('input').attr('type', 'text');
  module.input.append('button').text('+');

  module.addBubble = function (options, callback) {
    callback = callback || function () { };

    if (!(options.type in module.types)) {
      throw 'Unknown bubble type';
    } else {

      module.ID++;
      var id = module.ID;
      module.bubbles.push({
        id: id,
        type: options.type
        //additional info
      });
      module.keys[id] = module.bubbles.length - 1;

      //segment container
      var outer = module.flow.append('div')
        .attr('class', 'cb-segment cb-' + options.class)
        .attr('id', 'cb-segment-' + id);

      //speaker icon
      outer.append('div').attr('class', 'cb-icon');

      var bubble = outer.append('div')
        .attr('class', 'cb-bubble ' + options.class)
        // .style("height", "50px")
        .append('div')
        .attr('class', 'cb-inner');


      outer.append('hr');

      module.types[options.type](bubble, options, callback);

      module.scrollTo('end');

      return module.ID;
    }
  };

  //Default Bubble Types
  //The individual types are being organised this way in order to make it as easy as possible to extend the basic types.
  //cb.types['custom-1'] = function(bubble, options, callback){ custom_code; };

  /*

 //Example for custom bubble type

 var hw = 0;
 cb.types['hello'] = function(bubble, options, callback){
   hw++;
   bubble.append('p').text('Hello World ('+hw+')');
 };

 cb.addBubble({type:'hello', class:'bot'});
 cb.addBubble({type:'hello', class:'human'});

 */


  module.showInput = function (submitCallback, typeCallback) {
    //TODO: check if one can overwrite callbacks or if callbacks need to be properly removed
    if (typeCallback) {
      module.input.select('input')
        .on('change', function () {
          typeCallback(d3.select(this).node().value);
        });
    } else {
      module.input.select('input').on('change', function () { });
    }

    module.input.select('button')
      .on('click', function () {
        submitCallback(module.input.select('input').node().value);
      });

    module.input.style('display', 'block');
    module.flow.classed('cb-w-input', true);

    //TODO: set focus -> check if this works
    module.input.select('input').node().blur();
    module.scrollTo('end');
  };

  module.hideInput = function () {
    module.input.style('display', 'none');
    module.flow.classed('cb-w-input', false);
    module.scrollTo('end');
  };

  module.removeBubble = function (id) {
    module.flow.select('#cb-segment-' + id).remove();
    module.bubbles.splice(module.keys[id], 1);
    delete module.keys[id];
  };

  module.removeBubbles = function (id) {
    for (var i = module.bubbles.length - 1; i >= module.keys[id]; i--) {
      module.removeBubble(module.bubbles[i].id);
    }
  };

  module.getBubble = function (id) {
    return {
      el: module.flow.select('#cb-segment-' + id),
      obj: module.bubbles[module.keys[id]]
    };
  };

  //Accepts position = 'end' (bottom) || 'start' (top)
  module.scrollTo = function (position) {
    //start
    var s = 0;
    //end
    if (position == 'end') {
      s = module.scroll.property('scrollHeight') - window.innerHeight;
    }
    d3.select('#cb-flow').transition()
      .duration(300)
      .tween("scroll", scrollTween(s));

  };

  function scrollTween(offset) {
    return function () {
      var i = d3.interpolateNumber(module.scroll.property('scrollTop'), offset);
      return function (t) { module.scroll.property('scrollTop', i(t)); };
    };
  }

  return module;
});