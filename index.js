const dbName = "SCHOOL-DB";
const relName = "STUDENT-TABLE";
const baseUrl = "https://api.login2explore.com:5577";
const connToken = "90934733|-31949208829177514|90955824";

function resetForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('rollNo').disabled = false;
    document.getElementById('fullName').disabled = true;
    document.getElementById('className').disabled = true;
    document.getElementById('birthDate').disabled = true;
    document.getElementById('address').disabled = true;
    document.getElementById('enrollDate').disabled = true;

    document.getElementById('saveBtn').disabled = true;
    document.getElementById('changeBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;

    document.getElementById('rollNo').focus();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rollNo').addEventListener('blur', checkStudentRollNo);
});

function checkStudentRollNo() {
    const rollNo = document.getElementById('rollNo').value.trim();
    if (rollNo === '') {
        //alert('Roll No cannot be empty!');
        resetForm();
        return;
    }

    let jsonStr = {
        Roll_No: rollNo
    };
    let request = createGET_BY_KEYRequest(connToken, dbName, relName, JSON.stringify(jsonStr));
    jQuery.ajaxSetup({async: false});
    let resObj = executeCommandAtGivenBaseUrl(request, baseUrl, "/api/irl");
    jQuery.ajaxSetup({async: true});

    if (resObj.status === 400) {
        enableFormForNew();
    } else if (resObj.status === 200) {
        let data = JSON.parse(resObj.data).record;
        loadExistingStudent(data);
    }
}

function enableFormForNew() {
    document.getElementById('fullName').disabled = false;
    document.getElementById('className').disabled = false;
    document.getElementById('birthDate').disabled = false;
    document.getElementById('address').disabled = false;
    document.getElementById('enrollDate').disabled = false;

    document.getElementById('saveBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;

    document.getElementById('fullName').focus();
}

function loadExistingStudent(student) {
    document.getElementById('rollNo').disabled = true;
    document.getElementById('fullName').disabled = false;
    document.getElementById('className').disabled = false;
    document.getElementById('birthDate').disabled = false;
    document.getElementById('address').disabled = false;
    document.getElementById('enrollDate').disabled = false;

    document.getElementById('saveBtn').disabled = true;
    document.getElementById('changeBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;

    document.getElementById('fullName').value = student.Full_Name;
    document.getElementById('className').value = student.Class;
    document.getElementById('birthDate').value = student.Birth_Date;
    document.getElementById('address').value = student.Address;
    document.getElementById('enrollDate').value = student.Enrollment_Date;

    document.getElementById('fullName').focus();
}

function saveStudent() {
    const student = collectFormData();
    if (student == null) {
        alert('Please fill all fields correctly.');
        return;
    }

    let request = createPUTRequest(connToken, JSON.stringify(student), dbName, relName);
    jQuery.ajaxSetup({async: false});
    let resObj = executeCommandAtGivenBaseUrl(request, baseUrl, "/api/iml");
    jQuery.ajaxSetup({async: true});

    alert('Student record saved successfully!');
    resetForm();
}

function changeStudent() {
    const student = collectFormData();
    if (student == null) {
        alert('Please fill all fields correctly.');
        return;
    }

    let jsonStr = {
        Roll_No: student.Roll_No
    };
    let getRequest = createGET_BY_KEYRequest(connToken, dbName, relName, JSON.stringify(jsonStr));
    jQuery.ajaxSetup({async: false});
    let getRes = executeCommandAtGivenBaseUrl(getRequest, baseUrl, "/api/irl");
    jQuery.ajaxSetup({async: true});

    let rec_no = JSON.parse(getRes.data).rec_no;

    let updateRequest = createUPDATERecordRequest(connToken, JSON.stringify(student), dbName, relName, rec_no);
    jQuery.ajaxSetup({async: false});
    let resObj = await fetch('/api/proxy?endpoint=/api/iml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: request,
    }).then(res => res.json());
    jQuery.ajaxSetup({async: true});

    alert('Student record updated successfully!');
    resetForm();
}

function collectFormData() {
    const rollNo = document.getElementById('rollNo').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const className = document.getElementById('className').value.trim();
    const birthDate = document.getElementById('birthDate').value.trim();
    const address = document.getElementById('address').value.trim();
    const enrollDate = document.getElementById('enrollDate').value.trim();

    if (rollNo === '' || fullName === '' || className === '' || birthDate === '' || address === '' || enrollDate === '') {
        return null;
    }

    return {
        Roll_No: rollNo,
        Full_Name: fullName,
        Class: className,
        Birth_Date: birthDate,
        Address: address,
        Enrollment_Date: enrollDate
    };
}

/* ---- JsonPowerDB Helper Functions ---- */
function createPUTRequest(token, jsonObj, dbName, relName) {
    var putRequest = "{\n"
        + "\"token\" : \""
        + token
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n" + "\"cmd\" : \"PUT\",\n"
        + "\"rel\" : \""
        + relName + "\","
        + "\"jsonStr\": \n"
        + jsonObj
        + "\n"
        + "}";
    return putRequest;
}

function createUPDATERecordRequest(token, jsonObj, dbName, relName, rec_no) {
    var updateRequest = "{\n"
        + "\"token\" : \""
        + token
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n"
        + "\"cmd\" : \"UPDATE\",\n"
        + "\"rel\" : \""
        + relName + "\",\n"
        + "\"rec_no\": "
        + rec_no
        + ", \n"
        + "\"jsonStr\": \n"
        + jsonObj
        + "\n"
        + "}";
    return updateRequest;
}

function createGET_BY_KEYRequest(token, dbName, relName, jsonObjStr) {
    var getRequest = "{\n"
        + "\"token\" : \""
        + token
        + "\","
        + "\"dbName\": \""
        + dbName
        + "\",\n"
        + "\"cmd\" : \"GET_BY_KEY\",\n"
        + "\"rel\" : \""
        + relName
        + "\",\n"
        + "\"jsonStr\":\n"
        + jsonObjStr
        + "\n"
        + "}";
    return getRequest;
}

function executeCommandAtGivenBaseUrl(request, baseUrl, apiEndPointUrl) {
    var url = baseUrl + apiEndPointUrl;
    var jsonObj;
    $.post(url, request, function (result) {
        jsonObj = JSON.parse(result);
    }).fail(function (result) {
        var dataJsonObj = result.responseText;
        jsonObj = JSON.parse(dataJsonObj);
    });
    return jsonObj;
}
