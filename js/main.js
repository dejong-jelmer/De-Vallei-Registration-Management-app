
// load axios instance
var axios = axios.create({
    baseURL: 'http://de_vallei.test/api/v1',
    timeout: 5000
});


var login = new Vue({
    el: '#login',
    data: {
        time: 360,
        code: '',
        token: '',
        checked: [],
        // Only in development set to false in production
        debug: true,
        logedIn: false,
        lastNumber: '0',
        timerInterval: '',
        passwordLength: 1,
        message: 'Inloggen',
        name: 'test@test.com',
        reset: 'img/reset.png',
        bullet: 'img/bullet.png',
        firstNumbers: ['1','2','3','4','5','6','7','8','9']
    },

    methods: {
        bindCode(value) {
            this.code += value
            this.showBullet(this.code.length)
        },
        login() {  
            console.info('loggin in / retrieving token:')         
            axios.post(
                '/login', {
                    email:this.name,  
                    password:this.code
                }
            ).then(
                
                function(response) {
                    console.log('%c success', 'color:green')

                    login.token = response.data.token
                    login.message = "Login succesvol"
                    login.resetInput()

                    app.sessionToken = login.token
                    app.getAllCoachGroups(login.token)
                    app.logedIn = true;
                    login.logedIn = true;
                    login.timer()
                    
                }
            ).catch(
                function(response) {
                    login.message = "Fout bij inloggen"
                    login.resetInput()
                    
                    console.error('error: "'+response.response.status + ': ' + response.response.statusText +'"' )
                    
                }
            )
        },
        showBullet(index) {
            index -= 1
            if(index < this.passwordLength){

                this.checked[index].show = true;
            }
        },
        resetInput() {

            var i = 1;
            var bullets = []
            for(i; i <= this.passwordLength; i++) {
                bullets.push({show: false})
            }
            this.checked = bullets
            this.code = ''

        },
        timer() {
            this.timerInterval = window.setInterval(countdown, 1000)
                
            var stratTime = login.time

            function countdown() {

                login.time--

                document.onclick = function() {
                    login.time = stratTime
                }
                document.onmousemove = function() {
                    login.time = stratTime
                }
                document.onkeypress = function() {
                    login.time = stratTime
                }

                if(login.time == 0) {
                    console.info('Timed out: ')
                    app.logout()
                }
            }
        }
    },

    mounted: 
        function() {
            
            this.resetInput()
        
    },

    computed: {
        input() {
            if(this.code.length > 0) {
                return  true
            }
        }
    },    
    watch: {
        code() {
            
            if(this.code.length == this.passwordLength) {
                this.message = "Aanmelden..."
                this.login()

            } 
            
        }

    }
});

var app = new Vue({
    el:"#app",
    data: {
        modal: '',
        colors: [],
        coaches: [],
        statusen: [],
        coachgroep: [],
        logedIn: false,
        showMenu: false,
        openModal: false,
        showCoaches: '',
        sessionToken: '',
        selectedStatus: [],
        maxInputLenght: 20,
        showChoachgroep: '',
        menu: 'img/menu.png',
        back: 'img/reset.png',
        selectedStudenIndex: '',
        showSelectedStatus: false

    },

    methods: {
        getAllCoachGroups(token) {
            console.info('Getting all coachgroepen:')
            axios.get('/coachgroepen', {
                    headers: {'Authorization': 'Bearer ' + this.sessionToken}
                }                   
            )
            .then(
                function(response) {
                    console.log('%c success', 'color:green')

                    var coaches = []
                    for(var i = 0; i < response.data.coaches.length; i++) {
                        coaches.push(response.data.coaches[i])
                    } 
                    app.coaches = coaches
                                    
                }
            ).catch(
                function(response) {
                    console.error('error: "'+response.response.status + ': ' + response.response.statusText +'"' )
                    if(!login.debug) {
                        app.logout()
                    }
                }
            )
        
        },

        getCoachGroup(coachId) {
            console.info('getting coachgroep with id: ' + coachId + ':')
            axios.get('/coachgroep/' + coachId, {
                    headers: {'Authorization': 'Bearer ' + this.sessionToken}
                }
            ).then(
                function(response) {
                    console.log('%c success', 'color:green')

                    var coachgroep = []
                    for(var i = 0; i < response.data.coachgroep.length; i++) {
                        coachgroep.push(response.data.coachgroep[i])
                    } 
                    app.coachgroep = coachgroep  

                }
            ).catch(
                function(response) {
                    console.error('error: "'+response.response.status + ': ' + response.response.statusText +'"' )
                    
                    if(!login.debug) {
                        app.logout()
                    }
                }
            )
        },

        changeStatus(i) {

            var student = this.coachgroep[i]
            
            this.selectedStudenIndex = i

            // Aanmelden
            // als status niet gelijk is aan aanwezig
            if(this.aanwezig.id !== student.status_id) {

                bootbox.confirm(
                    {
                        message: 'Hallo <b>'+student.naam+'</b>, wil je je <u>aanmelden</u>?',     
                        buttons: {
                            confirm: {
                                label: 'Aanmelden',
                                className: 'btn-lg btn-success'
                            },
                            cancel: {
                                label: 'Niet aanmelden',
                                className: 'btn-danger'
                            }
                        },
                        callback: function(result) {
                            if(true === result) {
                                var reason = null
                            
                                app.updateStatus(i, app.aanwezig.id, reason)
                            }

                        }
                    }
                )
            // Afmelden
            } else {

                bootbox.confirm(
                    {
                        message: 'Hallo <b>' + student.naam + '</b> wil je je <u>afmelden</u>?',
                        buttons: {
                            confirm: {
                                label: 'Afmelden',
                                className: 'btn-lg btn-success'
                            },
                            cancel: {
                                label: 'Niet afmelden',
                                className: 'btn-danger'
                            }
                        },
                        callback: function(result) {
                            if(true === result) {
                                app.openModal = true
                                $('#modalId').modal({backdrop: "static"})

                            }
                        }
                    }
                )
            }
        },

        afmelden(i) {
            var message = ''
            var reason = false
            var status = this.selectable[i]
            var student = this.coachgroep[this.selectedStudenIndex]

            if(false == status.reason_requierd) {

                app.updateStatus(app.selectedStudenIndex, status.id, reason)

            } else {
              
                bootbox.prompt( 
                    {
                        
                        title: 'Hallo <b>'+student.naam+'</b>, met welke reden ga je '+status.status+'?',     
                        buttons: {
                            confirm: {
                                label: 'Afmelden',
                                className: 'btn-lg btn-success'
                            },
                            cancel: {
                                label: 'Niet afmelden',
                                className: 'btn-danger'
                            }
                        },
                        closeButton: false,
                        callback: function (result) {
                            if (null !== result && '' !== result) {
                                reason = result
                                if(reason.length < app.maxInputLenght) {

                                    app.updateStatus(app.selectedStudenIndex, status.id, reason)
                                    app.selectedStudenIndex = ''
                                } else {
                                    message = 'Je reden tekst te lang. Je bent <b>niet</b> afgemeld! </h4>'
                                    bootbox.alert(message)
                                }

                            } else {
                                message = 'Reden is leeg. Je bent <b>niet</b> afgemeld!</h4>'
                                bootbox.alert(message)
                            }
                
                        }
                    }

                )
            
            }
        },

        updateStatus(i, statusId, reason) {

            var student = this.coachgroep[i]
            console.info('updating status of id: ' + student.id + ' to status id: ' + statusId + ':')
            axios.post('/leerlingen/updatestatus/' + student.id + '/' + statusId+'?token='+this.sessionToken, {
                    headers: {'Authorization': 'Bearer ' + this.sessionToken},
                    reden: reason
                }
            ).then(
                function(response) {
                    console.log('%c success', 'color:green')

                    app.getCoachGroup(student.coach_id)

                }
            ).catch(
                function(response) {
                    console.error('error: "'+response.response.status + ': ' + response.response.statusText +'"' )
                    
                    if(!login.debug) {
                        app.logout()
                    }
                }
            )
        },

        terug() {
            this.coachgroep = [];
            this.showChoachgroep = false
            this.showCoaches = true
        },

        getMenu() {
            if(false === this.showMenu) {
                this.showMenu = true
            } else {
                this.showMenu = false
            }
        },

        getStatus(i) {

            app.showSelectedStatus = false
            app.selectedStatus = []
            var status = this.statusen[i]

            console.info('retrieving status of status id: ' + status.id + ':')

            axios.get('/status/' + status.id, {
                    headers: {'Authorization': 'Bearer ' + this.sessionToken},
                }
            ).then(
                function(response){
                    console.log('%c success', 'color:green')
                    app.showSelectedStatus = true
                    app.selectedStatus = response.data.status.students
                }
            ).catch(
                function(response) {
                    console.error('error: "'+response.response.status + ': ' + response.response.statusText +'"' )
                    
                    if(!login.debug) {
                        app.logout()
                    }
                }
            )
        },

        logout() {
            console.info('loggin of: ')
            axios.post('/logout', {
                    headers: {'Authorization': 'Bearer ' + this.sessionToken},
                    token: this.sessionToken
                }

            ).then(
                function(response) {
                    console.log('%c success', 'color:green')
                    app.logedIn = false
                    app.coaches = []
                    login.logedIn = false
                    login.message = 'Inloggen'
                    clearInterval(login.timerInterval)

                }
            ).catch(
                function(response) {
                    console.error('error: "'+response.response.status + ': ' + response.response.statusText +'"' )
                    
                }
            )
        }

    },

    watch: {
        coachgroep() {
            if(this.coachgroep.length > 0) {
                this.showChoachgroep = true
                this.showCoaches = false
            }

        },
        coaches() {
            if(this.coaches.length > 0) {
                this.showChoachgroep = false
                this.showCoaches = true
            }
        }
    },

    computed: {

        aanwezig() {
            
            var aanwezig = this.statusen.filter(status => status.status === 'aanwezig')
            
            return aanwezig[0]
            
        },
        selectable() {
            
            return this.statusen.filter(status => status.student_selectable === 1)
            
        },
        reasonRequired() {
            return this.statusen.filter(status => status.reason_requierd === 1)

        }
    },

    mounted: 
        function() {

            console.info('retrieving all stautses and colors: ')
            axios.get('/statuses'
            ).then(
                function(response) {
                    console.log('stautses:')
                    console.log('%c success', 'color:green')
                    app.statusen = response.data.statusen
                }
            ).catch(
                function(response) {
                    bootbox.alert("Fout: de app kan geen verbinding maken met de server.");
                    console.error('error: "'+response.status + ': ' + response.statusText +'"' )
                }
            )

            console.info('retrieving all colors: ')
            axios.get('/kleuren'
            ).then(
                function(response) {
                    console.log('colors:')
                    console.log('%c success', 'color:green')
                    app.colors = response.data.colors
                }
            ).catch(
                function(response) {
                    bootbox.alert("Fout: de app kan geen verbinding maken met de server.");
                    console.error('error: "'+response.status + ': ' + response.statusText +'"' )
                }
            )
        }


});