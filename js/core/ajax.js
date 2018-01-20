var aanwezig = "aanwezig";
var afwezig = "afwezig";

// get all coachgroups from API
// @var json web token
// @return JSON {all coach.groups}
// @return button value coach.id 
function getAllCoachGroups(token)
{
    var url = root + "/api/v1/coachgroep/alle?token="+token;

    return $.ajax({
        url: url,
        type: "GET",
        error: function(response) {console.log(response.responseJSON);},
        success: function(data){
                    
        $.each(data, function(i, coach) {
                                                            
                $("#coachGroupOutput").append("<button type='button' class='btn btn-block coachGroupButton' value='"+coach.id+"'>"+coach.coach+"</button>"+" <br><br>");      
            });

            $('.coachGroupButton').click(function(){  
                $("#coachColumn").fadeOut("fast");
                $("#arrowBack").animate({opacity: "1"});
                
                getCoachGroupStudents(this.value, token);
            });  
        }
    });
}

//  get all students from API related to coachgroup
//  @var coach.id (clicked button value)
//  @var json web token
//  @return JSON {all the choachgroups students student[studentdata] / student[status]}
//  @return button value student.id
function getCoachGroupStudents(id, token)
{
    var url = root + "/api/v1/coachgroep/"+id+"?token="+token;
    
    $("#studentColumn").fadeIn("slow");

    $("#studentsOutput").empty();
    
    // get all student from coachgroup                    
    return $.ajax({
        url: url,
        type: "GET",
        error: function(response) {console.log(response.responseJSON);},
        success: function(data) {  
            
            $.each(data, function(i, student) {
                console.log("student: ");
                console.log(student.reason);

                var reason = "";
                var reasonField = "";
                
                if (student.reason !== null) {
                    var reason = student.reason.reason;
                }

                $("#studentsOutput").append("<button id='studentBtn_"+student.id+"' type='button' class='btn btn-block studentButton' name='"+student.studentdata.voornaam+"' value='"+student.id+"' style='background:"+student.status.color+"'>"+student.studentdata.voornaam+"</button><span id='reasonField"+i+"'>"+reason+"</span><br> <br>");
                
            });

            $('.studentButton').click(function() {
               
                var studentId = this.value;
                var studentName = this.name;
                console.log(studentId);
                var url = 'http://devallei.dev/api/v1/leerlingen/status/'+studentId+"?token="+token;
                
                $.ajax({
                    url: url,
                    type: "GET",
                    error: function(response) {console.log(response.responseJSON);},
                    success: function(data) {


                                               
                        if (data.status.status != aanwezig) {
                            bootbox.confirm("Hallo "+studentName+", wil je je aanmelden?", function(result) {
                                if(result) {
                                    var reason = null
                                    updateStudentStatus(studentId, aanwezig, reason, token)
                                }

                            });
                        }

                        if (data.status.status == aanwezig) {

                            bootbox.confirm("Wil je je afmelden?", function(result) {
                                
                                if(result) {

                                    var url = root + "/api/v1/statuses/selectable?token="+token;
                                    
                                    // get status options JSON
                                    $.ajax({
                                        url: url,
                                        type: "GET",
                                        error: function(response) {console.log(response.responseJSON);},
                                        success: function(data) {
                                            var header = "Kies één van de knoppen om je af te melden:"
                                            var modal = new Modal(studentId, header, data);
                                            
                                            $("#modalOutput").html(modal.getModal());
                                            $("#modal_"+studentId).modal({backdrop: "static"});

                                            $("#modal_"+studentId).on('hidden.bs.modal', function() {
                                                var studentId = $("#signOutId").val();
                                                var status = $("#signOutStatus").val();
                                                var reasonRequierd = $("#signOutR_R").val();
                                                
                                                // clean hidden input fields from data
                                                $("#signOutId").val("");
                                                $("#signOutStatus").val("");
                                                $("#signOutR_R").val("");
                                                

                                                if (reasonRequierd == true) {

                                                    openReasonPrompt(studentId, status);

                                                    function openReasonPrompt(studentId, status) {
                                                    var reason = "";

                                                        bootbox.prompt("Met welke reden ga je "+status+"?", 
                                                            function callback(result) {
                                                                if (result !== null && result !== "") {

                                                                    reason = result;
                                                                    updateStudentStatus(studentId, status, reason, token); 
                                                                } else {
                                                                    bootbox.alert("Je bent vegeten een reden op te geven.", function(){    
                                                                        openReasonPrompt(studentId, status);
                                                                    });
                                                                }
                                                        
                                                        });
                                                    }
                                                   
                                                } else {
                                                    var reason = null;
                                                    updateStudentStatus(studentId, status, reason, token); 
                                                } // close if reasonRequierd              
                                            }); // close on modal close  
                                        } // close success function
                                    }); // close $.ajax
                                } // close if result
                            }) // close confirm aanmelden                   
                        } // close if aanwezig
                    } // close success function
                }); // close $.ajax
            }); // close student button click function
        } // close $.ajax
    }); // close $.ajax
} // close getCoachGroupStudents function



//  update the status of a student
//  @var stundent.id
//  @var status
//  @var reason
//  @var json web token
//  @return JSON {updated student status, status.color}

function updateStudentStatus(student_id, status, reason, token) 
{
    
    var url = root + "/api/v1/leerlingen/updatestatus/"+student_id+"?token="+token;

    return $.ajax({
        url:url,
        type: "POST",
        data: {"status":status, "reden":reason},
        error: function(response) {console.log(response.responseJSON);},
        success: function(satus) {
            console.log("satus response from API: ");
            console.log(satus);
            
            $("#studentBtn_"+student_id).css({'background': satus.color});
        }  
    });

}