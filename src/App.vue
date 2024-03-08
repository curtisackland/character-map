<template>
  <v-app>
    <v-app-bar>
      <Header></Header>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row class="d-flex justify-center align-center mt-2">
          <!-- Search/dropdown filters should go here -->
          Search/dropdown filters should go here
          <div class="test">
            <v-select
                label="Fonts"
                v-model="font"
                :items="fontOptions"
                item-title="text"
                item-value="value"
                class="mr-4"
            ></v-select>
          </div>
          <v-btn>Test</v-btn>
          <div class="d-flex justify-center">
            Currently selected font: {{ font }}
          </div>
        </v-row>
        <v-row>
          <v-col cols="7">
            <h4>Character Selection</h4>
            <v-virtual-scroll :items="['1']" style="height: 60vh;">
              <table class="w-100">
                <tbody>
                  <tr class="main-character-select-row p-0" v-for="row in getListAsTable(getAllCharacters(), 20, 40)">
                    <td class="main-character-select-data p-0" v-for="character in row">
                      <v-btn v-if="character != null" rounded="0" class="main-character-select-grid-button no-uppercase p-0 border-1" density="compact" @click="setCurrentCharacter(character)">{{character}}</v-btn>
                      <v-btn v-else rounded="0" class="main-character-select-grid-button no-uppercase p-0 border-1" density="compact">&nbsp;</v-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-virtual-scroll>
          </v-col>
          <v-col cols="5">
            <v-card class="p-4">
              <v-row>
                <v-col>
                  <v-card class="d-flex preview-background align-center justify-center">
                    <div :class="{ 'bold-font': bold, 'italicize-font': italicize, 'underline-font': underline }">
                      {{ currentCharacter.character }}
                    </div>
                  </v-card>
                </v-col>
                <v-col class="checkboxes">
                  <v-checkbox-btn v-model="bold" label="Bold" />
                  <v-checkbox-btn v-model="italicize" label="Italicize" />
                  <v-checkbox-btn v-model="underline" label="Underline" />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card-title class="p-0 mb-2">
                    Information:
                  </v-card-title>
                  <v-card-title class="p-0">
                    Keystroke: {{ currentCharacter.keyStroke }}
                  </v-card-title>
                  <v-card-title class="p-0">
                    Unicode: {{ currentCharacter.unicode }}
                  </v-card-title>
                </v-col>
                <v-col>
                  <v-card-title class="mb-2 p-0">
                    Groups:
                  </v-card-title>
                  <v-virtual-scroll style="display: flex; height: 70px" :items="currentCharacter.groups">
                    <template v-slot:default="{ item }">
                      {{ item }} <br>
                    </template>
                  </v-virtual-scroll>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="d-flex align-center justify-center">
                  <v-btn text="Add to Selected Characters" class="add-button" @click="addCharacter(currentCharacter.character)" />
                </v-col>
                <v-col class="d-flex align-center justify-center">
                  <v-tooltip
                      v-if="favourites.includes(currentCharacter.character)"
                      text="Remove from favourites"
                      location="right">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-bookmark" style="font-size: 5em" @click="removeFromFavourites(currentCharacter.character)"></v-icon>
                    </template>
                  </v-tooltip>
                  <v-tooltip
                      v-else
                      text="Add to favourites"
                      location="right">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-bookmark-outline" style="font-size: 5em" @click="addToFavourites(currentCharacter.character)"></v-icon>
                    </template>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="7">
            <v-row>
              <v-col class="mr-2">
                <h4>Favourites</h4>
                <v-virtual-scroll :items="['1']" style="height: 15vh;">
                  <table class="w-100">
                    <tbody>
                      <tr class="lower-character-select-row p-0" v-for="row in getListAsTable(favourites, 10, 4)">
                        <td class="lower-character-select-data p-0" v-for="character in row">
                          <v-btn v-if="character != null" rounded="0" class="lower-character-select-grid-button no-uppercase p-0 border-1" density="compact" @click="setCurrentCharacter(character)">{{character}}</v-btn>
                          <v-btn v-else rounded="0" class="lower-character-select-grid-button no-uppercase p-0 border-1" density="compact">&nbsp;</v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-virtual-scroll>
              </v-col>
              <v-col class="ml-2">
                <h4>Recents</h4>
                <v-virtual-scroll :items="['1']" style="height: 15vh;">
                  <table class="w-100">
                    <tbody>
                      <tr class="lower-character-select-row p-0" v-for="row in getListAsTable(characterHistory, 10, 4)">
                        <td class="lower-character-select-data p-0" v-for="character in row">
                          <v-btn v-if="character != null" rounded="0" class="lower-character-select-grid-button no-uppercase p-0 border-1" density="compact" @click="setCurrentCharacter(character)">{{character}}</v-btn>
                          <v-btn v-else rounded="0" class="lower-character-select-grid-button no-uppercase p-0 border-1" density="compact">&nbsp;</v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-virtual-scroll>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="5" class="p-4">
            <v-row>
              <v-text-field v-model="selectedCharacters" label="Selected Characters" hide-details clearable @click:clear="clearSelectedCharacters" class="mr-2 selected-characters-field">
              </v-text-field>
              <v-tooltip :text="copyToolTipText"
                         location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" text="Copy" class="add-button" @click="copySelectedCharacters" />
                </template>
              </v-tooltip>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Header from "@/components/Header.vue";

export default {
  name: 'App',
  components: {
    Header
  },
  methods: {
    addToFavourites(character) {
      this.favourites.unshift(character);
    },
    removeFromFavourites(characterToRemove) {
      this.favourites = this.favourites.filter(char => char !== characterToRemove)
    },
    addCharacter(character) {
      this.selectedCharacters += character;
      this.characterHistory.unshift(character);
    },
    clearSelectedCharacters() {
      this.selectedCharacters = '';
    },
    copySelectedCharacters() {
      navigator.clipboard.writeText(this.selectedCharacters);
      this.copyToolTipText = 'Characters copied to clipboard!'
      setTimeout(() => {
        this.copyToolTipText = 'Copy to clipboard';
      }, 1000);
    },
    getAllCharacters() {
      let chars = [];
      for (let i = 0; i < 150000; i++) {
        chars.push(String.fromCharCode(i));
      }
      return chars;
    },
    getListAsTable(list, columns, minRows) {
      let table = [];
      for (let i = 0; i * columns < list.length || i < minRows; i++) {
        table.push([]);
        for (let j = 0; j < columns; j++) {
          if (i * columns + j < list.length) {
            table[table.length - 1].push(list[i * columns + j]);
          } else {
            table[table.length - 1].push(null);
          }
        }
      }
      return table;
    },
    setCurrentCharacter(char) {
      this.currentCharacter.character = char;
      // TODO: update other parts of currentCharacter
    }
  },
  data() {
    return {
      font: 'Test1',
      fontOptions: [
        { text: 'Test Font 1', value: 'Test1' },
        { text: 'Test Font 2', value: 'Test2' },
        { text: 'Test Font 3', value: 'Test3' },
      ],
      selectedCharacters: '',
      characterHistory: [],
      currentCharacter: {
        character: '$',
        keyStroke: 'Shift + 4',
        unicode: 'U+0024',
        groups: [
          'Basic Latin',
          'Currency Symbol',
          'Currency Symbol2',
          'Currency Symbol3',
          'Currency Symbol4',
        ]
      },
      bold: false,
      italicize: false,
      underline: false,
      favourites: [],
      copyToolTipText: 'Copy to clipboard',
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.v-card-title {
  white-space: normal;
}

.test {
  width: 250px;
}

.preview-background {
  padding: 16px;
  //background-color: #2B2B2B;
  background-color: white;
  color: black;
  font-size: 7em;
}

.bold-font {
  font-weight: bold;
}

.italicize-font {
  font-style: italic;
}

.underline-font {
  text-decoration: underline;
}

.checkboxes {
  display: flex;
  flex-direction: column;
}

.add-button {
  background-color: #373737;
  height: 70px;
}

.selected-characters-field {
  height: 80px;
}

.main-character-select-row {
  width: 100%;

}

.main-character-select-data {
  width: 5%;
}

.main-character-select-grid-button {
  width: 100%;
  height: auto;
  min-width: 0.5em; /*Need to override vue default*/
  aspect-ratio: 1;
  font-size: 100%
}

.lower-character-select-row {
  width: 100%;

}

.lower-character-select-data {
  width: 10%;
}

.lower-character-select-grid-button {
  width: 100%;
  height: auto;
  min-width: 0.5em; /*Need to override vue default*/
  aspect-ratio: 1;
  font-size: 100%
}

.no-uppercase {
  text-transform: unset;
}

/* Custom scrollbar styles */
.v-virtual-scroll::-webkit-scrollbar {
  width: 3px;
}

.v-virtual-scroll::-webkit-scrollbar-thumb {
  background-color: #888;
}

.v-virtual-scroll::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
</style>
