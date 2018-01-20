

function Modal(studenId, headerText, data)
{
        this.i = 0;
        this.content = [];
        
        this.studenId = studenId;
        this.headerText = headerText;
        this.data = data;

        this.getModal = getModal;

        this.open = "<div id='modal_"+this.studenId+"' class='modal fade' role='dialog'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'></button><h4 class='modal-title'>"+this.headerText+"</h4></div><div class='modal-body'>";
        this.end = "</div><div class='modal-footer'></div></div></div></div>";
        
        for (this.i; this.i < this.data.length; this.i++) {
            this.content +="<button type='button' class='btn btn-lg' style='background:"+this.data[this.i].color+";' value='{\"id\": \""+this.studenId+"\", \"status\": \""+this.data[this.i].status+"\", \"r_r\": \""+this.data[this.i].reason_requierd+"\"}' onClick='setValue(this.value);' data-dismiss='modal'>"+this.data[this.i].text+"</button>&nbsp;";
        }
        
}

function getModal() 
{
        return this.open+this.content+this.end;
}
   

function setValue(studentStatus) 
{
        
        
        var studentStatus = JSON.parse(studentStatus);

        document.getElementById('signOutId').value = studentStatus.id;
        document.getElementById('signOutStatus').value = studentStatus.status;
        document.getElementById('signOutR_R').value = studentStatus.r_r;
}

function showReasonField(i,reason) 
{
    
    $("#reasonBtn"+i).click(function(){
        var btn = document.getElementById("reasonField"+i);
        var field = $("#reasonField"+i);

        field.prepend("<button id='reasonBtn"+i+"'>+</button>");

        if(btn.style.display == 'none') {
            btn.style.display = 'block';
            field.append(reason);
        } else {
            btn.style.display = 'none';
            field.empty();
        }

    });

}

