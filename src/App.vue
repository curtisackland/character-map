<template>
  <v-app>
    <v-app-bar>
      <Header></Header>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row class="d-flex justify-center align-center mt-2">
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
        </v-row>
        <div class="d-flex justify-center">
          Currently selected font: {{ font }}
        </div>
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

  },
  data() {
    return {
      font: 'Test1',
      fontOptions: [
        { text: 'Test Font 1', value: 'Test1' },
        { text: 'Test Font 2', value: 'Test2' },
        { text: 'Test Font 3', value: 'Test3' },
      ]
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

.test {
  width: 250px;
}
</style>
