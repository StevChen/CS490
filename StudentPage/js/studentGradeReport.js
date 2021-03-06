var examid = "";
var questionJSON;
var pointsJSON;
var answersJSON;
var list = [];
var counter = 0;

//GetStudentExam() 	 	Send request to getStudent exam id  of the student
//GetExam()			 	Callback function of GetStudnetExam, send the request to get question of the Exam
//GetQuestions()		Send request to get questions of the exam
//getQuestionPoint() 	Send request to get points of each exam question
//getPoints()        	Callback function for getQuestionPoint
//getStudAnswers()		Send request to get student's answers
//gotAnswers()			Callback function for getStudAnswers
//buildExam()			Build Exam Layout
//buildQuestion()		Formulate Questions
//parseAns()			Student Answers parser, replace <dq> with ", <nl> with \n
//setGradeAndComment()	Send request to set the new Grade and new Comment
//setGradeSuccess()		Callback function for setAnswerGrade Request
//setCommentSuccess()	Callback function for setAnswerComment Request
//releaseScore()		Callback function for setExamRelease Request

//-----------------------------------------------------------------------------------
window.onload = function(){
	//console.log("Student Report")
	var usr = sessionStorage.getItem("usr");
	//console.log("stud: " + usr);

	getStudExam();
}

function getStudExam(){
	var usr = sessionStorage.getItem("usr");
	var stdRequest = {
		act: "getStudExam",
		user: usr
	}
	//console.log(stdRequest);
	request(stdRequest, getExam);
}

function getExam(respones){
	//console.log(respones);
	var id = JSON.parse(respones).getStudExam;
	examid = id;
	//console.log(id);
	var stdRequest = {
		act: "getQuestionsExam",
		exam: id
	}
	//console.log(stdRequest);
	request(stdRequest, getQuestions);
}

function getQuestions(response){
	//console.log(response);
	var text = response.slice(0, -1);
	text = "[" + text + "]";
	
	questionJSON = JSON.parse(text);

	getQuestionsPoints();
	//buildExam(json);
}


function getQuestionsPoints(){
	//console.log(response);
	var stdRequest = {
		act: "getPointsExam",
		exam: examid
	}
	//console.log(stdRequest);
	request(stdRequest, getPoints);
}

function getPoints(response){
	//console.log(response);
	pointsJSON = JSON.parse(response);
	getStudAnswers()
	//buildExam()
}

function getStudAnswers(){
	var stdRequest = {
		act: "getAnswers",
		user: sessionStorage.getItem("usr"),
		examid: examid
	}
	//console.log(stdRequest);
	request(stdRequest, gotAnswers)
}

function gotAnswers(response){
	//console.log(response);
	var text = response.slice(0, -1);
	text = "[" + text + "]";
	
	answersJSON = JSON.parse(text);
	//console.log(answersJSON);
	if(answersJSON.length === 0){
		pop_overlayer("Not Released Yet");
		document.getElementById("backBtn").removeEventListener("click", pop_overlayer);
		document.getElementById("backBtn").addEventListener("click", function(){
			document.location.replace("HomePage.html");
		})
		return;
	}
	buildExam();
}

function printResponse(response){
	//console.log(response);
}

function buildExam(){
	var examArea = document.getElementById("exam");
	//console.log(questionJSON);
	var j = 0;
	var totalGrade = 0;
	var totalPoint = 0;
	for(var i =0; i<questionJSON.length; i++){
		if(questionJSON[i].id == "0"){
			continue;
		}
		//console.log(pointsJSON["p"+(i+1)]);
		totalPoint += Number(pointsJSON["p"+(i+1)]);
		totalGrade += Number(answersJSON[j].grade);


		//Student's Answer
		var question = buildQuestion(questionJSON[i]);
		var div = document.createElement("div");
		div.id = ("q"+questionJSON[i].id);
		div.style.borderBottom = "2px solid black";
		div.style.padding = "50px 0";

		var p = document.createElement("p");
		p.innerHTML = question + "(pt. " + "<span>" +pointsJSON["p"+(i+1)] + "</span>" + ").";

		var textArea = document.createElement("textarea");
		textArea.rows = "8";
		textArea.cols = "50";
		if(answersJSON[j].txt != ""){
			var ans = parseAns(answersJSON[j].txt);
			textArea.value = ans;
		}else{
			textArea.value = "Empty";
		}
		textArea.setAttribute("disabled", true);
		textArea.classList.add("stdTextArea");

		//End Student's Anwer


		//Main Report
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");

		var grade = document.createElement("tr");
		var grade_col1 = document.createElement("td");
		var grade_col2 = document.createElement("td");
		grade_col1.innerHTML = "Grade: ";
		grade_col2.innerHTML = answersJSON[j].grade;
		grade.appendChild(grade_col1);
		grade.appendChild(grade_col2);

		var comment = document.createElement("tr");
		var comment_col1 = document.createElement("td");
		var comment_col2 = document.createElement("td");
		comment_col2.classList.add("comment");
		comment_col2.style.padding = "0px 10px";
		//var comment_textarea = document.createElement("textarea");
		//comment_textarea.rows = "15";
		//comment_textarea.cols = "120";
		//comment_textarea.value = answersJSON[j].comment.replace(/<br>/g, "\n");

		comment_col1.innerHTML = "Comment: ";
		comment_col2.innerHTML = answersJSON[j].comment.replace(/Test/g, "<hr>Test").replace("score(round to int):", "<hr><strong>score(round to int):</strong>").replace(/<hl>/g, "<span class=\"stdhighlight\">").replace(new RegExp("</hl>", "g"), "</span>");
		//comment_col2.appendChild(comment_textarea);
		comment.appendChild(comment_col1);
		comment.appendChild(comment_col2);

		var pro_comment = document.createElement("tr");
		var pro_comment_col1 = document.createElement("td");
		var pro_comment_col2 = document.createElement("td");
		pro_comment_col1.innerHTML = "Professor's Comment: ";
		//pro_comment_col2.innerHTML = answersJSON[j].comment;
		pro_comment.appendChild(pro_comment_col1);
		pro_comment.appendChild(pro_comment_col2);

		tbody.appendChild(grade);
		tbody.appendChild(comment);
		//tbody.appendChild(pro_comment);

		//End Main Report



		var innerDiv = document.createElement("div");
		table.appendChild(tbody);
		div.appendChild(p);
		div.appendChild(textArea);
		div.appendChild(table);
		div.appendChild(innerDiv);
		examArea.appendChild(div);
		j++;
	}

	document.getElementById("total").innerHTML = "Total: " + totalGrade + " out of " + totalPoint;

}

function parseAns(text){
	var parsedText = text.replace(/<nl>/g,"\n");
	parsedText = parsedText.replace(/<dq>/g, '\"');
	return parsedText;
}

function buildQuestion(json){
	var text = "Please write a function named " + json.name + " with arguments " + json.args + " that : " + json.txt + "\n";
	//text += "Example: " + json.output +"\n";
	return text;
}
