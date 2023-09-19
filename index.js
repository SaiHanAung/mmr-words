import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";

import {
    getDatabase,
    set,
    ref,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDAAqGV8uZ-ujXky3KNpoW6aEdEdN8-YF4",
    authDomain: "sai-dev-4d945.firebaseapp.com",
    projectId: "sai-dev-4d945",
    storageBucket: "sai-dev-4d945.appspot.com",
    messagingSenderId: "301392195652",
    appId: "1:301392195652:web:9f102e7e33ed7323ee0c11",
    measurementId: "G-RR8EJMHZVQ"
};

const c = console.log.bind()
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);
const vm = Vue.createApp({
    data() {
        return {
            email: '',
            password: '',
            isLoggedIn: false,
            isLoading: false,
            see: {},
            words: [],
            input: {}
        }
    },
    methods: {
        getData() {
            const starCountRef = ref(database, 'mmr_words');
            onValue(starCountRef, (snapshot) => {
                this.words = snapshot.val()
            })
        },
        updateWord() {
            let word = this.input.mmr
            let data = this.words[word[0]]

            data.push({
                mmr: this.input.mmr,
                eng: this.input.eng,
                th: this.input.th
            })

            update(ref(database, 'mmr_words/'), {
                [word[0]]: data
            })
                .then(() => {
                    $('#addWordModal').modal('hide')
                    this.getData()
                    this.input = {}
                })
                .catch((error) => {
                    console.error(error)
                    alert("ไม่สามารถเพิ่มคำได้")
                })
        },
        editWord() {
            const index = this.see.index
            const word = this.see.word.mmr
            let data = this.words[word[0]]

            data[index] = this.see.word

            update(ref(database, 'mmr_words/'), {
                [word[0]]: data
            })
                .then(() => {
                    $('#editWordModal').modal('hide')
                    this.getData()
                    this.input = {}
                })
                .catch((error) => {
                    console.error(error)
                    alert("ไม่สามารถแก้ไขคำได้")
                })
        },
        deleteWord(index) {
            const word = this.see.word.mmr
            let data = this.words[word[0]]

            data.splice(index, 1)

            update(ref(database, 'mmr_words/'), {
                [word[0]]: data
            })
                .then(() => {
                    $('#editWordModal').modal('hide')
                    this.getData()
                    this.input = {}
                })
                .catch((error) => {
                    console.error(error)
                    alert("ไม่สามารถลบคำได้")
                })
        },
        move(side, index) {
            const word = this.see.word.mmr
            const symb = side == 'up' ? index - 1 : index + 1
            let data = this.words[word[0]]

            let temp = data[index];
            data[index] = data[symb];
            data[symb] = temp;

            update(ref(database, 'mmr_words/'), {
                [word[0]]: data
            })
                .catch((error) => {
                    console.error(error)
                    alert("ไม่สามารถเลื่อนคำได้")
                })
        },
        addWord() {
            let word = this.input.mmr

            if (this.filteredWord.some(el => el[0] == word[0])) {
                this.updateWord()
                return;
            }

            set(ref(database, 'mmr_words/' + word[0]), [{
                mmr: this.input.mmr,
                eng: this.input.eng,
                th: this.input.th
            }])
                .then(() => {
                    $('#addWordModal').modal('hide')
                    this.getData()
                    this.input = {}
                })
                .catch((error) => {
                    console.error(error)
                    alert("ไม่สามารถเพิ่มคำได้")
                })
        },
        checkAuth() {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    const uid = user.uid;
                    this.isLoggedIn = true
                } else {
                    // User is signed out
                    // ...
                }
            });
        },
        signIn() {
            signInWithEmailAndPassword(
                auth, this.email, this.password
            ).then((userCredential) => {
                this.getData()
                this.isLoggedIn = true
            }).catch((error) => {
                alert("อีเมลหรือรหัสผ่านผิด")
            });
        },
        doSignOut() {
            const auth = getAuth();
            signOut(auth).then(() => {
                location.reload()
            }).catch((error) => {
                console.error(error)
            });
        },
        hideOffcanvas(id) {
            $('#' + id).offcanvas('hide')
        }
    },
    computed: {
        filteredWord() {
            let words = Object.entries(this.words)
            const searchText = this.see.search

            if (searchText) {
                let txt = []
                words.forEach(el => {
                    el[1].forEach(word => {
                        if (word.mmr?.includes(searchText)) txt.push([el[0], [word]])

                        word.th?.forEach(t => {
                            if (t.mean?.includes(searchText)) txt.push([el[0], [word]])
                        })
                    })
                })
                return txt
            }

            return words
        }
    },
    async mounted() {
        await this.checkAuth()
        await this.getData()
    },
})

vm.mount("#app")

