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
              v-model="font"
              searchable
              label="Search For Font"
              :items="fontOptions"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="searchForCharacter"
              label="Search Character By Name Or Unicode"
              :clearable="true"
              @update:modelValue="groupByOption"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-select
              searchable
              label="Group By Option"
              v-model="groupOption"
              :items="[
                'All',
                'Arabic',
                'Armenian',
                'CJK',
                'Cyrillic',
                'Georgian',
                'Greek',
                'Korean',
                'Hebrew',
                'Japanese Hiragana and Katakana',
                'Latin',
                'Thai',
                'Unicode Subrange',
              ]"
              @update:modelValue="groupByOption"
            ></v-select>
          </v-col>
          <v-col cols="5">
            <v-select
              searchable
              label="Group By Option Subrange Option"
              v-model="groupSubrangeOption"
              :disabled="!enableSubrange"
              :items="[
                'All',
                'Control',
                'Format',
                'Lowercase Letter',
                'Modifier Letter',
                'Other Letter',
                'Uppercase Letter',
                'Spacing Mark',
                'Enclosing Mark',
                'Nonspacing Mark',
                'Decimal Number',
                'Letter Number',
                'Other Number',
                'Connector Punctuation',
                'Dash Punctuation',
                'Close Punctuation',
                'Final Punctuation',
                'Initial Punctuation',
                'Other Punctuation',
                'Open Punctuation',
                'Currency Symbol',
                'Modifier Symbol',
                'Math Symbol',
                'Other Symbol',
                'Line Separator',
                'Paragraph Separator',
                'Space Separator',
              ]"
              @update:modelValue="groupByOption"
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
          <v-alert v-if="groupCharacterData.length === 0" type="error">
            No results
          </v-alert>
        </v-row>
        <v-row class="ml-0">
          <h4>Character Selection</h4>
        </v-row>
        <v-row>
          <v-col class="character-grid-col" cols="7">
            <v-virtual-scroll v-if="characterData" :items="getListAsTable(groupCharacterData, 20, 12)" style="display:flex; flex-wrap: wrap; height: 610px" class="character-grid">
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
                      @dblclick="addCharacter(character ?? null)"
                      :style="'font-family: ' + font + ';'">
                    {{ character ? character['symbol'] : ' ' }}
                  </v-btn>
                </v-btn-group>
              </template>
            </v-virtual-scroll>
          </v-col>
          <v-col>
            <v-card class="p-4">
              <v-row class="justify-center">
                <v-card-title class="d-flex justify-center w-100">
                  {{ currentCharacter['@na'] ?? 'No Name Found' }}
                </v-card-title>
              </v-row>
              <v-row>
                <v-col>
                  <v-card
                    class="d-flex preview-background align-center justify-center h-100"
                  >
                    <div
                      :style="'font-family: ' + font + ';'"
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
                  <v-card-title class="mb-2 p-0">
                    Groups:&nbsp;&nbsp;
                    <v-tooltip
                        location="top"
                        close-delay="1000"
                        width="25%"
                    >
                      <template v-slot:activator="{ props }">
                        <v-icon
                            v-bind="props"
                            icon="mdi-information-outline"
                        ></v-icon>
                      </template>
                      <span>
                        For more information on character groups and what they mean, visit:
                        <a href="https://en.wikipedia.org/wiki/Unicode_block#List_of_blocks" target="_blank">https://en.wikipedia.org/wiki/Unicode_block#List_of_blocks</a>
                      </span>
                    </v-tooltip>
                  </v-card-title>
                  <v-virtual-scroll
                    style="display: flex; height: 70px"
                    :items="currentCharacter.groupNames"
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
                  :style="'font-family: ' + font + ';'"
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
                <v-virtual-scroll v-if="characterData" :items="getListAsTable(favourites, 10, 2)" style="display:flex; flex-wrap: wrap; height: 610px" class="character-grid">
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
                          :style="'font-family: ' + font + ';'"
                          @click="setCurrentCharacter(character ?? null)"
                          @dblclick="addCharacter(character ?? null)">
                        {{ character ? character['symbol'] : ' ' }}
                      </v-btn>
                    </v-btn-group>
                  </template>
                </v-virtual-scroll>
              </v-col>
              <v-col class="ml-2">
                <h4>Recents</h4>
                <v-virtual-scroll v-if="characterData" :items="getListAsTable(characterHistory, 10, 2)" style="display:flex; flex-wrap: wrap; height: 610px" class="character-grid">
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
                          :style="'font-family: ' + font + ';'"
                          @click="setCurrentCharacter(character ?? null)"
                          @dblclick="addCharacter(character ?? null)">
                        {{ character ? character['symbol'] : ' ' }}
                      </v-btn>
                    </v-btn-group>
                  </template>
                </v-virtual-scroll>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <div class="snackbar-container d-flex justify-center align-bottom">
          <v-card class="snackbar-card rounded-2 w-50 m-2">
            <v-row>
              <v-col cols="10">
                <v-card-title>
                  Character added: {{ characterAddedSnackbarLetter }}
                </v-card-title>
              </v-col>
              <v-col cols="2">
                <v-btn class="m-1" @click="closeSnackbar()">
                  Close
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </div>
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
    groupByOption(){

      this.enableSubrange = false;
      let temp = [];
      let groupString = []

      switch(this.groupOption){
        case "All":
          this.groupCharacterData = this.characterData;
          break;
        case "Arabic":
          groupString = [
          "Arabic", "Arabic_Ext_A", "Arabic_Ext_B",
          "Arabic_Ext_C", "Arabic_Math", "Arabic_PF_A",
          "Arabic_PF_B", "Arabic_Sup"
          ];
          break;
        case "Armenian":
          groupString = ["Armenian"];
          break;
        case "CJK":
          groupString = [
            "CJK", "CJK_Compat", "CJK_Compat_Forms", "CJK_Compat_Ideographs",
            "CJK_Compat_Ideographs_Sup", "CJK_Ext_A", "CJK_Ext_B", "CJK_Ext_C",
            "CJK_Ext_D", "CJK_Ext_E", "CJK_Ext_F", "CJK_Ext_G","CJK_Ext_H",
            "CJK_Ext_I", "CJK_Radicals_Sup", "CJK_Strokes", "CJK_Symbols"
          ];
          break;
        case "Cyrillic":
          groupString = [
          "Cyrillic", "Cyrillic_Ext_A", "Cyrillic_Ext_B",
          "Cyrillic_Ext_C", "Cyrillic_Ext_D", "Cyrillic_Sup"
          ];
          break;
        case "Georgian":
          groupString = ["Georgian", "Georgian_Ext", "Georgian_Sup"];
          break;
        case "Greek":
          groupString = ["Greek", "Greek_Ext"];
          break;
        case "Korean":
          groupString = ["Hangul"];
          break;
        case "Hebrew":
          groupString = ["Hebrew"];
          break;
        case "Japanese Hiragana and Katakana":
          groupString = ["Hiragana", "Katakana", "Katakana_Ext"];
          break;
        case "Latin":
          groupString = [
          "Latin_1_Sup", "Latin_Ext_A", "Latin_Ext_Additional",
          "Latin_Ext_B", "Latin_Ext_C", "Latin_Ext_D",
          "Latin_Ext_E", "Latin_Ext_F", "Latin_Ext_G"
          ];
          break;
        case "Thai":
          groupString = ["Thai"];
          break;
        case "Unicode Subrange":
          this.enableSubrange = true;
          this.groupByOptionSubrange();
          break;
      }

      let search = this.searchForCharacter ?? "";
      search = search.toLowerCase();
      search = search.replace(/^u\+/, "");
      if ((this.groupOption != "Unicode Subrange") && (this.groupOption != "All")){
        for (let i = 0; i < this.characterData.length; i++){
          if (this.characterData[i]['groups'].some(r=>groupString.includes(r)) && ((this.characterData[i]['@na'] && this.characterData[i]['@na'].toLowerCase().includes(search)) || (this.characterData[i]['@cp'] && this.characterData[i]['@cp'].toLowerCase().includes(search)))){
            temp.push(this.characterData[i]);
          }
        }
        this.groupCharacterData = temp;
      }

      if (this.groupOption === "All") {
        for (let i = 0; i < this.characterData.length; i++){
          if ((this.characterData[i]['@na'] && this.characterData[i]['@na'].toLowerCase().includes(search)) || (this.characterData[i]['@cp'] && this.characterData[i]['@cp'].toLowerCase().includes(search))) {
            temp.push(this.characterData[i]);
          }
        }
        this.groupCharacterData = temp;
      }
    },
    groupByOptionSubrange(){

      let temp = [];
      let groupString = []

      switch(this.groupSubrangeOption){
        case "All":
          groupString = [
          "Cc", "Cf", "Ll", "Lm", "Lo",
          "Lt", "Lu", "Mc", "Me", "Mn",
          "Nd", "Nl", "No", "Pc", "Pd",
          "Pe", "Pf", "Pi", "Po", "Ps",
          "Sc", "Sk", "Sm", "So", "Zl",
          "Zp", "Zs"
          ];
          break;
        case "Control":
          groupString = ["Cc"];
          break;
        case "Format":
          groupString = ["Cf"];
          break;
        case "Lowercase Letter":
          groupString = ["Ll"];
          break;
        case "Modifier Letter":
          groupString = ["Lm"];
          break;
        case "Other Letter":
          groupString = ["Lo"];
          break;
        case "Titlecase Letter":
          groupString = ["Lt"];
          break;
        case "Uppercase Letter":
          groupString = ["Lu"];
          break;
        case "Spacing Mark":
          groupString = ["Mc"];
          break;
        case "Enclosing Mark":
          groupString = ["Me"];
          break;
        case "Nonspacing Mark":
          groupString = ["Mn"];
          break;
        case "Decimal Number":
          groupString = ["Nd"];
          break;
        case "Letter Number":
          groupString = ["Nl"];
          break;
        case "Other Number":
          groupString = ["No"];
          break;
        case "Connector Punctuation":
          groupString = ["Pc"];
          break;
        case "Dash Punctuation":
          groupString = ["Pd"];
          break;
        case "Close Punctuation":
          groupString = ["Pe"];
          break;
        case "Final Punctuation":
          groupString = ["Pf"];
          break;
        case "Initial Punctuation":
          groupString = ["Pi"];
          break;
        case "Other Punctuation":
          groupString = ["Po"];
          break;
        case "Open Punctuation":
          groupString = ["Ps"];
          break;
        case "Currency Symbol":
          groupString = ["Sc"];
          break;
        case "Modifier Symbol":
          groupString = ["Sk"];
          break;
        case "Math Symbol":
          groupString = ["Sm"];
          break;
        case "Other Symbol":
          groupString = ["So"];
          break;
        case "Line Separator":
          groupString = ["Zl"];
          break;
        case "Paragraph Separator":
          groupString = ["Zp"];
          break;
        case "Space Separator":
          groupString = ["Zs"];
          break;
      }

      let search = this.searchForCharacter ?? "";
      search = search.toLowerCase();
      search = search.replace(/^u\+/, "");
      for (let i = 0; i < this.characterData.length; i++){
        if (this.characterData[i]['groups'].some(r=>groupString.includes(r))  && ((this.characterData[i]['@na'] && this.characterData[i]['@na'].toLowerCase().includes(search)) || (this.characterData[i]['@cp'] && this.characterData[i]['@cp'].toLowerCase().includes(search)))){
          temp.push(this.characterData[i]);
        }
      }
      this.groupCharacterData = temp;

    },
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
      this.addCharSnackbar(character);
      this.selectedCharacters += character['symbol'];
      if (!this.characterHistory.includes(character))
      {
        this.characterHistory.unshift(character);
      }
    },
    addCharSnackbar(character) {
      this.characterAddedSnackbarLetter = character["symbol"];
      this.characterAddedSnackbarVisibility = "visible";
      this.characterAddedSnackbarLastOpen = Date.now();
      window.setTimeout(this.closeSnackbarTimerCallback, 3000)
    },
    closeSnackbarTimerCallback() {
      if (this.characterAddedSnackbarLastOpen + 3001 < Date.now()) {
        this.closeSnackbar();
      }
    },
    closeSnackbar() {
      this.characterAddedSnackbarVisibility='hidden';
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
            temp['groupNames'] = [];
            const groupMap = { "Cc": "Control", "Cf": "Format", "Ll": "Lowercase Letter", "Lm": "Modifier Letter", "Lo": "Other Letter",
              "Lt": "Titlecase Letter", "Lu": "Uppercase Letter", "Mc": "Spacing Mark", "Me": "Enclosing Mark", "Mn": "Nonspacing Mark",
              "Nd": "Decimal Number", "Nl": "Letter Number", "No": "Other Number", "Pc": "Connector Punctuation", "Pd": "Dash Punctuation",
              "Pe": "Close Punctuation", "Pf": "Final Punctuation", "Pi": "Initial Punctuation", "Po": "Other Punctuation", "Ps": "Open Punctuation",
              "Sc": "Currency Symbol", "Sk": "Modifier Symbol", "Sm": "Math Symbol", "So": "Other Symbol", "Zl": "Line Separator",
              "Zp": "Paragraph Separator", "Zs": "Space Separator"};
            if (data.ucd.repertoire.group[i].char[j]['@gc']) {
              if (data.ucd.repertoire.group[i].char[j]['@gc'] in groupMap) {
                temp['groups'].push(data.ucd.repertoire.group[i].char[j]['@gc']);
                temp['groupNames'].push(groupMap[data.ucd.repertoire.group[i].char[j]['@gc']]);
              } else {
                temp['groups'].push(data.ucd.repertoire.group[i].char[j]['@gc']);
                temp['groupNames'].push(data.ucd.repertoire.group[i].char[j]['@gc']);
              }
            } else {
              if (data.ucd.repertoire.group[i]['@gc'] in groupMap) {
                temp['groups'].push(data.ucd.repertoire.group[i]['@gc']);
                temp['groupNames'].push(groupMap[data.ucd.repertoire.group[i]['@gc']]);
              } else {
                temp['groups'].push(data.ucd.repertoire.group[i]['@gc']);
                temp['groupNames'].push(data.ucd.repertoire.group[i]['@gc']);
              }
            }
            temp['groups'].push(data.ucd.repertoire.group[i]['@blk']);
            temp['groupNames'].push(data.ucd.repertoire.group[i]['@blk']);
            this.characterData.push(temp);
          }
        }
      }
      this.groupCharacterData = this.characterData;
    }
  },
  data() {
    return {
      font: "Segoe UI",
      fontOptions: [
        {title: "Segoe UI", value: "Segoe UI"},
        { title: "Arial", value: "Arial" },
        { title: "Tahoma", value: "Tahoma" },
        { title: "Helvetica", value: "Helvetica" },
        { title: "Georgia", value: "Georgia" },
        { title: "Courier", value: "Courier" },
        { title: "Comic Sans MS", value: "Comic Sans MS" },
      ],
      selectedCharacters: "",
      characterHistory: [],
      currentCharacter: {
        "symbol": "A",
        "@cp": "0041",
        "@na": "LATIN CAPITAL LETTER A",
        "groups": ["Lu", "ASCII"],
        "groupNames": ["Uppercase Letter", "ASCII"],
        "@gc": "Lu",
      },
      bold: false,
      italicize: false,
      underline: false,
      characterAddedSnackbarLetter: false,
      characterAddedSnackbarVisibility: "hidden",
      characterAddedSnackbarLastOpen: 0,
      favourites: [],
      copyToolTipText: "Copy to clipboard",
      characterData: [],
      groupOption: "All",
      groupSubrangeOption: "All",
      enableSubrange: false,
      groupCharacterData: [],
      searchForCharacter: "",
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

.v-tooltip :deep(.v-overlay__content) {
  pointer-events: initial;
}

.preview-background {
  padding: 16px;
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

.snackbar-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  pointer-events: none;
  align-items: flex-end;
}

.snackbar-card {
  height: 3em;
  pointer-events: initial;
  visibility: v-bind(characterAddedSnackbarVisibility);
}

.character-grid-col {
  min-width: 700px;
}

.character-grid >>> .v-virtual-scroll__container {
  width: 100%;
}

.grid-buttons {
  flex: 1;
  width: 5%;
  min-width: 5%;
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
