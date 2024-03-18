<template>
  <v-app>
    <v-app-bar>
      <Header></Header>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="6">
            <v-select
              searchable
              label="Search For Font"
              :items="[
                'Font 1',
                'Font 2',
                'Font 3',
                'Font 4',
                'Font 5',
                'Font 6',
              ]"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-text-field
              label="Search Character By Name Or Unicode"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-select
              searchable
              label="Group By Option"
              :items="[
                'Option 1',
                'Option 2',
                'Option 3',
                'Option 4',
                'Option 5',
                'Option 6',
              ]"
            ></v-select>
          </v-col>
          <v-col cols="5">
            <v-select
              searchable
              label="Group By Option Subrange Option"
              :items="[
                'Option 7',
                'Option 8',
                'Option 9',
                'Option 10',
                'Option 11',
                'Option 12',
              ]"
            ></v-select>
          </v-col>
          <v-col cols="1" class="text-center" style="height: 100%">
            <v-icon
              size="40"
              color="white"
              icon="mdi-information-outline"
            ></v-icon>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-container class="group-by-options-view"> </v-container>
          </v-col>
        </v-row>

        <v-row class="ml-0">
          <h4>Character Selection</h4>
        </v-row>
        <v-row>
          <v-col cols="7">
            <v-virtual-scroll v-if="characterData" :items="getListAsTable(characterData, 20, 12)" style="display:flex; flex-wrap: wrap; height: 610px" class="character-grid">
              <template class="w-100" v-slot="{ item }">
                <v-btn-group
                  divided
                  rounded="0"
                  class="w-100 h-100"
                >
                  <v-btn
                      v-for="character in item"
                      rounded="0"
                      density="compact"
                      class="grid-buttons no-uppercase border-1"
                      @click="setCurrentCharacter(character ?? null)"
                      @dblclick="addCharacter(character ?? null)">
                    {{ character ? character['symbol'] : ' ' }}
                  </v-btn>
                </v-btn-group>
              </template>
            </v-virtual-scroll>
          </v-col>
          <v-col cols="5">
            <v-card class="p-4">
              <v-row class="justify-center">
                <v-card-title>
                  {{ currentCharacter['@na'] ?? 'No Name Found' }}
                </v-card-title>
              </v-row>
              <v-row>
                <v-col>
                  <v-card
                    class="d-flex preview-background align-center justify-center h-100"
                  >
                    <div
                      :class="{
                        'bold-font': bold,
                        'italicize-font': italicize,
                        'underline-font': underline,
                      }"
                    >
                      {{ currentCharacter['symbol'] }}
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
                  <v-card-title class="p-0 mb-2"> Information: </v-card-title>
                  <v-card-title class="p-0">
                    Keystroke: {{ currentCharacter['@ks'] ? 'ALT+' + currentCharacter['@ks'] : 'None' }}
                  </v-card-title>
                  <v-card-title class="p-0">
                    Unicode: {{ 'U+' + currentCharacter['@cp'] }}
                  </v-card-title>
                </v-col>
                <v-col>
                  <v-card-title class="mb-2 p-0"> Groups: </v-card-title>
                  <v-virtual-scroll
                    style="display: flex; height: 70px"
                    :items="currentCharacter.groups"
                  >
                    <template v-slot:default="{ item }">
                      {{ item }} <br />
                    </template>
                  </v-virtual-scroll>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="d-flex align-center justify-center">
                  <v-btn
                    text="Add to Selected Characters"
                    class="add-button"
                    @click="addCharacter(currentCharacter)"
                  />
                </v-col>
                <v-col class="d-flex align-center justify-center">
                  <v-tooltip
                    v-if="favourites.includes(currentCharacter)"
                    text="Remove from favourites"
                    location="right"
                  >
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        icon="mdi-bookmark"
                        style="font-size: 5em"
                        @click="
                          removeFromFavourites(currentCharacter)
                        "
                      ></v-icon>
                    </template>
                  </v-tooltip>
                  <v-tooltip v-else text="Add to favourites" location="right">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        icon="mdi-bookmark-outline"
                        style="font-size: 5em"
                        @click="addToFavourites(currentCharacter)"
                      ></v-icon>
                    </template>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-card>
            <v-row class="m-0 mt-2">
              <v-text-field
                  v-model="selectedCharacters"
                  label="Selected Characters"
                  hide-details
                  clearable
                  @click:clear="clearSelectedCharacters"
                  class="mr-2 selected-characters-field"
              >
              </v-text-field>
              <v-tooltip :text="copyToolTipText" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                      v-bind="props"
                      text="Copy"
                      class="add-button"
                      @click="copySelectedCharacters"
                  />
                </template>
              </v-tooltip>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-row>
              <v-col class="mr-2">
                <h4>Favourites</h4>
                <v-virtual-scroll :items="['1']" style="height: 15vh">
                  <table class="w-100">
                    <tbody>
                      <tr
                        class="lower-character-select-row p-0"
                        v-for="row in getListAsTable(favourites, 10, 4)"
                      >
                        <td
                          class="lower-character-select-data p-0"
                          v-for="character in row"
                        >
                          <v-btn
                            v-if="character != null"
                            rounded="0"
                            class="lower-character-select-grid-button no-uppercase p-0 border-1"
                            density="compact"
                            @click="setCurrentCharacter(character)"
                            >{{ character['symbol'] }}</v-btn
                          >
                          <v-btn
                            v-else
                            rounded="0"
                            class="lower-character-select-grid-button no-uppercase p-0 border-1"
                            density="compact"
                            >&nbsp;</v-btn
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-virtual-scroll>
              </v-col>
              <v-col class="ml-2">
                <h4>Recents</h4>
                <v-virtual-scroll :items="['1']" style="height: 15vh">
                  <table class="w-100">
                    <tbody>
                      <tr
                        class="lower-character-select-row p-0"
                        v-for="row in getListAsTable(characterHistory, 10, 4)"
                      >
                        <td
                          class="lower-character-select-data p-0"
                          v-for="character in row"
                        >
                          <v-btn
                            v-if="character != null"
                            rounded="0"
                            class="lower-character-select-grid-button no-uppercase p-0 border-1"
                            density="compact"
                            @click="setCurrentCharacter(character)"
                            >{{ character['symbol'] }}</v-btn
                          >
                          <v-btn
                            v-else
                            rounded="0"
                            class="lower-character-select-grid-button no-uppercase p-0 border-1"
                            density="compact"
                            >&nbsp;</v-btn
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-virtual-scroll>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Header from "@/components/Header.vue";
import data from "./character_data.json"

export default {
  name: "App",
  components: {
    Header,
  },
  methods: {
    addToFavourites(character) {
      this.favourites.unshift(character);
    },
    removeFromFavourites(characterToRemove) {
      this.favourites = this.favourites.filter(
        (char) => char !== characterToRemove
      );
    },
    addCharacter(character) {
      if (character == null) {
        return
      }

      this.selectedCharacters += character['symbol'];
      if (!this.characterHistory.includes(character))
      {
        this.characterHistory.unshift(character);
      }
    },
    clearSelectedCharacters() {
      this.selectedCharacters = "";
    },
    copySelectedCharacters() {
      navigator.clipboard.writeText(this.selectedCharacters);
      this.copyToolTipText = "Characters copied to clipboard!";
      setTimeout(() => {
        this.copyToolTipText = "Copy to clipboard";
      }, 1000);
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
      if (char != null) {
        this.currentCharacter = char;
      }
    },
    async getCharacters() {
      for (let i = 0; i < data.ucd.repertoire.group.length; i++) {
        if (data.ucd.repertoire.group[i].char) {
          for (let j = 0; j < data.ucd.repertoire.group[i].char.length; j++) {
            let temp = {};
            temp['@cp'] = data.ucd.repertoire.group[i].char[j]['@cp'];
            temp['symbol'] = String.fromCharCode(parseInt(data.ucd.repertoire.group[i].char[j]['@cp'], 16));
            temp['@ks'] = data.ucd.repertoire.group[i].char[j]['@ks'];
            temp['@na'] = data.ucd.repertoire.group[i].char[j]['@na'];

            temp['groups'] = [];
            if (data.ucd.repertoire.group[i].char[j]['@gc']) {
              temp['groups'].push(data.ucd.repertoire.group[i].char[j]['@gc'])
            } else {
              temp['groups'].push(data.ucd.repertoire.group[i]['@gc']);
            }
            temp['groups'].push(data.ucd.repertoire.group[i]['@blk']);
            this.characterData.push(temp);
          }
        }
      }
    }
  },
  data() {
    return {
      font: "Test1",
      fontOptions: [
        { text: "Test Font 1", value: "Test1" },
        { text: "Test Font 2", value: "Test2" },
        { text: "Test Font 3", value: "Test3" },
      ],
      selectedCharacters: "",
      characterHistory: [],
      currentCharacter: {
        "symbol": "A",
        "@cp": "0041",
        "@na": "LATIN CAPITAL LETTER A",
        "groups": ["Lu", "ASCII"],
        "@gc": "Lu",
      },
      bold: false,
      italicize: false,
      underline: false,
      favourites: [],
      copyToolTipText: "Copy to clipboard",
      characterData: [],
    };
  },
  mounted() {
    this.getCharacters();
  }
};
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

.group-by-options-view {
  border: 1px solid white;
  height: 100px;
  width: 100%;
  margin-bottom: 20px;
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
  font-size: 100%;
}

.character-grid >>> .v-virtual-scroll__container {
  width: 100%;
}

.grid-buttons {
  flex: 1;
  width: 5%;
  min-width: 5%;
  max-width: 5%;
  height: auto;
  aspect-ratio: 1;
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
  font-size: 100%;
}

.no-uppercase {
  text-transform: unset;
}

/* Custom scrollbar styles */
.v-virtual-scroll::-webkit-scrollbar {
  width: 8px;
}

.v-virtual-scroll::-webkit-scrollbar-thumb {
  background-color: #888;
}

.v-virtual-scroll::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
</style>
