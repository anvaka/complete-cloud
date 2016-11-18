<template>
  <div id='app'>
    <div class='header'>
      <h2>Google autocomplete results for</h2>
      <select v-model='selected'>
        <option v-for='q in questions' :value='q.key'>{{q.display}}</option>
      </select>
    </div>
    <div class='content'>
      <svg viewbox='0 0 800 800' @click='handleClick' @touchstart='handleTouchStart' @touchend='handleTouchEnd' @touchmove='handleTouchEnd'>
          <g ref='scene'> 
          </g>
      </svg>
    </div>
    <div class='suggestions' v-if='suggestions.show'>
      <div class='header'>
        <h3>{{suggestions.title}}</h3>
        <a href='#' @click='closeSuggesitons' class='close'>x</a>
      </div>
      <ul>
        <li v-for='s in suggestions.list'>
          <a :href='getLink(s)' target='_blank' v-html='s' :title='getText(s)'><a>
        </li>
      </ul>
    </div>
    <div class='about'>
      <a href='https://github.com/anvaka/complete-cloud#complete-cloud'>About...</a>
    </div>
  </div>
</template>

<script>
import appModel from './model/appModel.js'
import panzoom from 'panzoom';
import svg from 'simplesvg';
import wordCloud from './lib/wordLayout/index.js';

var shapes = ['circle', 'cardioid', 'square',  'star', 'triangle-forward', 'triangle', 'pentagon'];
var colorThemes = [
  ['#657537', '#B5AE4B', '#305254'],
  ['#950725', '#1F0202', '#BD6E00', '#BD7900', '#BD2F00'],
  ['#120B26', '#682C21', '#955612']
]

export default {
  name: 'app',
  data () { return appModel },
  mounted() {
    var scene = this.$refs.scene;
    this.zoomer = panzoom(scene);
  },

  methods: {
    handleClick(e) {
      var text = getTextFromEvent(e);
      if (text) {
        this.autoScale = 0;
        appModel.showAllMatches(text);
      }
    },
    adjustScale(scene) {
      var sceneRect = scene.getBBox()
      var zoomer = this.zoomer;

      var width = scene.ownerSVGElement.clientWidth;
      var height = scene.ownerSVGElement.clientHeight;

      var scale = Math.min(width, height) / Math.max(sceneRect.width, sceneRect.height)

      var x = (width - sceneRect.width * scale) / 2;
      var y = (height - sceneRect.height * scale) / 2;

      zoomer.zoomAbs(0, 0, 1)
      zoomer.moveTo(-sceneRect.x, -sceneRect.y)
      zoomer.zoomAbs(0, 0, scale)
      zoomer.moveBy(x, y)
    },

    handleTouchStart(e) {
      this.autoScale = 0;
      if (e.touches > 1) {
        this.cancelDetails();
        return;
      }

      var text = getTextFromEvent(e);
      if (!text) {
        this.cancelDetails();
        return;
      }

      if (this.scheduledDetails) {
        this.cancelDetails();
      }

      this.scheduledDetails = setTimeout(() => {
        appModel.showAllMatches(text);
      }, 1500)
    },

    handleTouchEnd(e) {
      this.cancelDetails()
    },

    cancelDetails() {
      if (this.scheduledDetails) {
        clearTimeout(this.scheduledDetails);
        this.scheduledDetails = null;
      }
    },

    closeSuggesitons() {
        appModel.hideAllMatches();
    },
    getLink(s) {
      return 'https://www.google.com/#q=' + encodeURIComponent(this.getText(s));
    },
    getText(s) {
      return s.replace(/<\/?b>/g, '');
    }
  },
  watch: {
    selected(value) {
      var scene = this.$refs.scene;
      scene.innerHTML = '';
      appModel.hideAllMatches();
      var item = appModel.getItem(value);
      var self = this;
      self.autoScale = 150;

      if (item) {
        if (this.cloud) {
          this.cloud.dispose()
          this.cloud = null;
        }
        var shape = getShapeByItem(item);

        this.cloud = wordCloud(item.words, {
          shape,
          gridSize: 4,
          weightFactor: 1.42,
          fontFamily: 'Helvetica, sans-serif',
          maxRotation: Math.PI/2,
          minRotation: Math.PI/2
        });
        this.cloud.on('wordclouddrawn', onDrawn);
        this.cloud.on('wordcloudstop', () => this.autoScale = 0);
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
        });
        text.text(word)
        scene.appendChild(text);
        if (self.autoScale > 0) {
          self.autoScale -= 1;
          self.adjustScale(scene);
        }
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

function dist(x, y) {
  return Math.abs(x - y);
}

function getTextFromEvent(e) {
  if (e.target && e.target.tagName === 'text') return e.target.text();
}

function getShapeByItem(item) {
  return shapes[item.words.length % shapes.length];
}

function getColorFunction(item) {
  var themeIndex = item.words.length % colorThemes.length;
  var theme = colorThemes[themeIndex]

  return function(word, weight, fontSize, distance, theta) {
    var idx = word.length % theme.length;
    return theme[idx]
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

.close {
  position: absolute;
  right: 13px;
  top: 9px;
  text-decoration: none;
}

.suggestions {
  position: absolute;
  left: 0;
  top: 0px;
  bottom: 0;
  width: 300px;
  overflow: hidden;
  background: white;
  text-align: left;
  flex-direction: column;
  display: flex;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
}

.suggestions h3 {
  margin: 8px 10px;
  font-family: sans-serif;
  font-weight: normal;
}
.suggestions ul {
  padding: 10px;
  overflow-y: auto;
  flex: 1;
  margin: 0;
border-top: 1px solid #aaa;
}

.suggestions ul li {
  width: 100%;
  overflow: hidden;
}

.suggestions ul li a {
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 24px;
  text-decoration: none;
  overflow: hidden;
  display: inline-block;
  width: 100%;
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

a {
  color: #42b983;
  text-decoration: none;
}
.about {
  position: absolute;
  right: 8px;
  bottom: 0px;
  background: rgba(245, 245, 245, 0.4)
}
</style>

