<template>
  <div id='app'>
    <div class='header'>
      <h2>Google autocomplete results for</h2>
      <select v-model='selected'>
        <option v-for='q in questions' :value='q.key'>{{q.display}}</option>
      </select>
    </div>
    <div class='content'>
      <svg viewbox='0 0 800 800'>
          <g ref='scene'> 
          </g>
      </svg>
    </div>
  </div>
</template>

<script>
import appModel from './model/appModel.js'
import panzoom from 'panzoom';
import svg from 'simplesvg';
import wordCloud from './lib/wordLayout/index.js';

export default {
  name: 'app',
  data () { return appModel },
  mounted() {
    var scene = this.$refs.scene;
    var zoomer = panzoom(scene)
    zoomer.moveBy((window.innerWidth - 800)/2, 0);
  },
  watch: {
    selected(value) {
      var scene = this.$refs.scene;
      scene.innerHTML = '';
      var item = this.questions.find(x => x.key === value);
      if (item) {
        console.log('selected')
        if (this.cloud) {
          this.cloud.dispose()
          this.cloud = null;
        }
        this.cloud = wordCloud(item.words, {
          gridSize: 4,
          weightFactor: 1.42,
          fontFamily: 'sans-serif'
        });
        this.cloud.on('wordclouddrawn', onDrawn);
      }

      function onDrawn(drawn, item)  {
        append(drawn, item[0]);
      }

      function append(record, word) {
        var rotateDeg = record.rotate * 180/Math.PI;
        var text = svg('text', {
          x: record.x,
          y: record.y,
          transform: 'scale(' + record.scale + ',' + record.scale + ') translate(' + record.translate.x + ',' + record.translate.y + ') rotate(' + rotateDeg + ')',
          fill: record.color,
          'font-size': record.fontSize + 'px',
          'font-family': record.fontFamily,
        //  'dominant-baseline': 'central'
        })
        text.text(word)
        scene.appendChild(text);
      }
    }
  },
  computed: {
    selectedText() {
      if (!this.selected) return '';

      var item = this.questions.find(x => x.key === this.selected);
      if (item) return item.words;
    }
  }
}

</script>

<style scoped>
canvas {
  display: none;
}
.content {
  position: relative;
  flex: 1;
}

#app, svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

svg:focus {
  outline: none;
}


#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

img {
  width: 200px;
  height: 200px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
