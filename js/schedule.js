// Gets formated hour by dividing by 100, and adds two zeros if necessary.
// Hour is in format HHMM as integer
function formattedHour(hour) {
	return Math.floor(hour / 100) + ":" + ((hour % 100 === 0) ? "00" : (hour % 100));
}

// Arrays of colors classes, schedule hours and days
var arrColors = ["bgm-blue", "bgm-purple", "bgm-bluegray", "bgm-lightgreen", "bgm-teal", "bgm-deeppurple", "bgm-deeporange", "bgm-lightblue", "bgm-amber",  "bgm-cyan", "bgm-lime", "bgm-green", "bgm-indigo",  "bgm-orange", "bgm-black", "bgm-brown", "bgm-yellow", "bgm-gray", ];
var arrHours = [700, 730, 800, 830, 900, 930, 1000, 1030, 1100, 1130, 1200, 1230, 1300, 1330, 1400, 1430, 1500, 1530, 1600, 1630, 1700, 1730, 1800, 1830, 1900, 1930, 2000, 2030, 2100, 2130, 2200, 2230, 2300, 2330];
var Days = {
	monday: "Lunes",
	tuesday: "Martes",
	wednesday: "Miércoles",
	thursday: "Jueves",
	friday: "Viernes",
	saturday: "Sábado",
	// sunday: "Dómingo"
};
var arrDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Constructor of subject
function Subject(iName, sCode, arrDays, iStart, iDuration, arrTeachers, sBuilding, sClassroom, arrOptions, sCourseDate, iPriority, sType, arrChildrenCourses, bHasParentCourse, sParentCourse, iUnits, iCapacity, iStudentsRegistered) {
	this.name = iName;
	this.code = sCode;
	this.days = arrDays;
	this.start = iStart;
	this.duration = iDuration;
	this.teachers = arrTeachers;
	this.building = sBuilding;
	this.classroom = sClassroom;
	this.options = arrOptions;
	this.courseDate = sCourseDate;
	this.priority = iPriority;
	this.type = sType;
	this.childrenCourses = arrChildrenCourses;
	this.hasParentCourse = bHasParentCourse;
	this.parentCourse = sParentCourse;
	this.units = iUnits;
	this.capacity = iCapacity
	this.studentsRegistered = iStudentsRegistered;
	this.getStartHour = function() {
		return formattedHour(this.start);
	};
	// Gets the finish hour with the sum of the start plus duration
	this.getEndHour = function() {
		return formattedHour(arrHours[arrHours.indexOf(this.start) + this.duration]);
	};
	// Gets an array with all the half hours of the period of class
	this.getHalfHoursPeriod = function() {
		var arrPeriod = [];
		var iIndexHour = arrHours.indexOf(this.start);
		for (var i = 0; i < this.duration; i++) {
			arrPeriod.push(arrHours[iIndexHour]);
			iIndexHour++;
		}
		return arrPeriod;
	};
	this.getCode = function() {
		return this.code.split(".")[0]; // Divides code string by the period and return just the code
	};
	this.getGroup = function() {
		return this.code.split(".")[1]; // Divides code string by the period and return just the group
	};
	this.isFull = function() { 
		return this.capacity == this.studentsRegistered; // Checks if the group is full
	}
}

/*

PRINTS SCHEDULE AT HOME

 */

function printScheduleHome(arrSubjects) {
	// Sort function first orders ascending by hour, and then by the last day the class is given
	// This ensures, the subjectPointer works correctly
	arrSubjects.sort(function(a, b) {
		if (a.start === b.start) {
			return arrDays.indexOf(a.days[a.length - 1]) - arrDays.indexOf(a.days[a.length - 1]);
		}
		else {
			return a.start - b.start;
		}
	});

	// Pointer to just check the subjects that are not printed yet
	var iSubjectsPointer = 0;

	// Function executed for every hour in the global array
	$.each(arrHours, function(iHour, eHour) {
		// If it's past 18:00 and all the subjects are already printed, stop printing
		if ((eHour > 1830) && (iSubjectsPointer === arrSubjects.length)) {
			return false;
		}

		// String of the HTML of each <tr>
		var sCellText = "<tr>";

		// First cell is always the hour
		// If the hour is o'clock, it should be printed, else not
		if(eHour % 100 === 0) {
			sCellText += "<td class='hour-cell' rowspan='2'>" + formattedHour(eHour) + "</td>";
		}

		// Iterate over every day of the week, which is every cell
		$.each(arrDays, function(iDay, eDay) {
			var iCountSubjects = iSubjectsPointer; // Gets the global count of the subjects that should be looked for
			var bSubjectFound = false; // Verifies if there is a subject in that cell

			// Iterate over left subjects
			while(iCountSubjects < arrSubjects.length) {
				// Verifiy if the subject is given that day
				if (arrSubjects[iCountSubjects].days.indexOf(eDay) >= 0) {
					// Verify if it's the first hour given
					if (arrSubjects[iCountSubjects].getHalfHoursPeriod().indexOf(eHour) === 0) {
						// Add the <td> the day, hour, current color, the rowspan which is the duration of the subject, the building and the classroom
						sCellText += "<td class='" + eDay + " h-" + eHour + " " +
										arrColors[iCountSubjects] + "' rowspan='" + arrSubjects[iCountSubjects].duration + "'>" + 
										arrSubjects[iCountSubjects].name + "<br>" + "<span>" + arrSubjects[iCountSubjects].building + " - " + 
										arrSubjects[iCountSubjects].classroom + "</span></td>";
						bSubjectFound = true;
					}
					// If it's found, but it's not the first instance, it should not print anything because of the rowspan of the first occurence
					else if(arrSubjects[iCountSubjects].getHalfHoursPeriod().indexOf(eHour) > 0) {
						bSubjectFound = true;
					}

					// If it's the last cell of a subject, adds one to subjects and colors pointers
					if(arrSubjects[iCountSubjects].getHalfHoursPeriod().indexOf(eHour) === (arrSubjects[iCountSubjects].duration - 1)) {
						if(arrSubjects[iCountSubjects].days.indexOf(eDay) === (arrSubjects[iCountSubjects].days.length - 1)) {
							iSubjectsPointer++;
						}
					}
				}
				iCountSubjects++;
			}
			// If it wasn't found, finish to print an empty cell
			if(!bSubjectFound) {
				sCellText += "<td class='" + eDay + " h-" + eHour + "'></td>";
			}
		});

		sCellText += "</tr>"; // Close the <tr>
		$("#scheduleHome tbody").append(sCellText); // Apend the <tr> to the body
	});
}

/*

PRINTS SCHEDULE AT SELECTION OF SCHEDULE

 */

function printScheduleAtSelection(arrSubjects) {
	// Sort function first orders ascending by hour, and then by the last day the class is given
	// This ensures, the subjectPointer works correctly
	arrSubjects.sort(function(a, b) {
		if (a.start === b.start) {
			return arrDays.indexOf(a.days[a.length - 1]) - arrDays.indexOf(a.days[a.length - 1]);
		}
		else {
			return a.start - b.start;
		}
	});

	// Pointer to just check the subjects that are not printed yet
	var iSubjectsPointer = 0;

	// Function executed for every hour in the global array
	$.each(arrHours, function(iHour, eHour) {
		// String of the HTML of each <tr>
		var sCellText = "<tr>";

		// First cell is always the hour
		// If the hour is o'clock, it should be printed, else not
		if(eHour % 100 === 0) {
			sCellText += "<td class='hour-cell' rowspan='2'>" + formattedHour(eHour) + "</td>";
		}

		// Iterate over every day of the week, which is every cell
		$.each(arrDays, function(iDay, eDay) {
			var iCountSubjects = iSubjectsPointer; // Gets the global count of the subjects that should be looked for
			var bSubjectFound = false; // Verifies if there is a subject in that cell

			// Iterate over left subjects
			while(iCountSubjects < arrSubjects.length) {
				// Verifiy if the subject is given that day
				if (arrSubjects[iCountSubjects].days.indexOf(eDay) >= 0) {
					// Verify if it's the first day given
					if (arrSubjects[iCountSubjects].getHalfHoursPeriod().indexOf(eHour) === 0) {
						// Add the <td> the current color, the rowspan which is the duration of the subject, the building and the classroom
						sCellText += "<td class='" + eDay + " h-" + eHour + " " +
									arrColors[iCountSubjects] + "' rowspan='" + arrSubjects[iCountSubjects].duration + "'>" + 
									arrSubjects[iCountSubjects].name + "<br>" + "<span>" + arrSubjects[iCountSubjects].building + " - " + 
									arrSubjects[iCountSubjects].classroom + "</span></td>";
						bSubjectFound = true;
					}
					// If it's found, but it's not the first instance, it should not print anything because of the rowspan of the first occurence
					else if(arrSubjects[iCountSubjects].getHalfHoursPeriod().indexOf(eHour) > 0) {
						bSubjectFound = true;
					}

					// If it's the last cell of a subject, adds one to subjects and colors pointers
					if(arrSubjects[iCountSubjects].getHalfHoursPeriod().indexOf(eHour) === (arrSubjects[iCountSubjects].duration - 1)) {
						if(arrSubjects[iCountSubjects].days.indexOf(eDay) === (arrSubjects[iCountSubjects].days.length - 1)) {
							iSubjectsPointer++;
						}
					}
				}
				iCountSubjects++;
			}
			// If it wasn't found, finish to print an empty cell
			if(!bSubjectFound) {
				sCellText += "<td class='" + eDay + " h-" + eHour + "'></td>";
			}
		});

		sCellText += "</tr>"; // Close the <tr>
		$("#scheduleAtSelection tbody").append(sCellText); // Apend the <tr> to the body
	});
}


/*

PRINTS SUMMARY

 */

function printSummary(arrSubjects, $summaryCardOriginal) {
	$.each(arrSubjects, function(iSubject, eSubject) {
		var $summaryCard = $summaryCardOriginal.clone(true); // Clones the original to not modifying it

		// Add color, code and name to the header
		$summaryCard.find(".card-header").addClass(arrColors[iSubject]);
		$summaryCard.find(".card-header h2").append(eSubject.code + " " + eSubject.name);
		
		// Adds each teacher of the subject
		$.each(eSubject.teachers, function(iTeacher, eTeacher) {
			$summaryCard.find(".teachers").append(eTeacher);
			// If it's not the last teacher, append a break
			if(iTeacher !== (eSubject.teachers.length - 1)) {
				$summaryCard.find(".teachers").append("<br>");
			}
		});

		$summaryCard.find(".date").append(eSubject.courseDate);

		// Adds each day the subject is given
		$.each(eSubject.days, function(iDay, eDay) {
			$summaryCard.find(".class-schedule").append(Days[eDay]);
			// If it's not the last day, append a comma
			if(iDay !== (eSubject.days.length - 1)) {
				$summaryCard.find(".class-schedule").append(", ");
			}
		});

		// Adds start and end hour
		$summaryCard.find(".class-schedule").append(" " + eSubject.getStartHour() + " - " + eSubject.getEndHour());

		// Adds building and classroom
		$summaryCard.find(".building-classroom").append(eSubject.building + " " + eSubject.classroom);

		// Add extra attributes of class
		$.each(eSubject.options, function(iOption, eOption) {
			$summaryCard.find(".options").append(eOption);
			// If it's not the last option, append a break
			if(iOption !== (eSubject.options.length - 1)) {
				$summaryCard.find(".options").append("<br>");
			}
		});

		// Shows the parent course if it has one
		if(eSubject.hasParentCourse) {
			$summaryCard.find(".material-list").append("<li><p class='element parent-course'>" + eSubject.parentCourse + "</p><p class='description'>Acredita</p></li>");
		}

		// Apends the card to the html
		$(".summary").append($summaryCard);

		// If it's the second card, add a clearfix
		if((iSubject > 0) && (iSubject % 2 !== 0)) {
			$(".summary").append("<div class='clearfix'></div>");
		}
	});
}

/*

VERIFY IF THE CLASS OVERLAPS WITH SOME OTHER CLASS

 */
function isOverlapping(eSubject) {
	$.each(eSubject.getHalfHoursPeriod(), function(iHour, eHour){
		$.each(eSubject.days, function(iDay, eDay) {
			if (!$("#scheduleAtSelection ." + eDay + ".h-" + eHour + ":empty").length) {
				return false;
			}
		});
	});
}

/*

GETS SINGLE SUBJECT CARD

 */

function getSubjectCard(eSubject, $subjectCardOriginal, iGroupsNum) {
	var $subjectCard = $subjectCardOriginal.clone(true); // Clones the original to not modifying it
	// Adds all properties to the subject card
	$subjectCard.find(".subject-title").append(eSubject.name);
	$subjectCard.find(".priority").append(eSubject.priority);
	$subjectCard.find(".code").append(eSubject.getCode());
	$subjectCard.find(".units").append(eSubject.units);

	// If the subject has children courses, make the link to courses tab
	if(eSubject.childrenCourses.length > 0) {
		$subjectCard.find(".material-list").first().append("<li><p class='element courses-num'>" + eSubject.childrenCourses.length + "</p><p class='description'>Cursos</p></li>");
		$subjectCard.attr('href', '#coursesTab');
		$subjectCard.attr('aria-controls', 'coursesTab');
		$subjectCard.addClass('to-courses');
	}
	// If the subject has no children courses, make the link direct to groups tab
	else {
		$subjectCard.find(".material-list").first().append("<li><p class='element groups-num'>" + iGroupsNum + "</p><p class='description'>Grupos</p></li>");
		$subjectCard.attr('href', '#groupsTab');
		$subjectCard.attr('aria-controls', 'groupsTab');
		$subjectCard.addClass('to-groups');
	}

	return $subjectCard;
}

/*

GETS SINGLE GROUP CARD

 */

function getGroupCard(eSubject, $groupCardOriginal) {
	var $groupCard = $groupCardOriginal.clone(true); // Clones the original to not modifying it
	// Adds all properties to the subject card
	$groupCard.find(".subject-title").append(eSubject.teachers[0]);
	$groupCard.find(".group").append(eSubject.getGroup());
	$groupCard.find(".hour").append(eSubject.getStartHour() + " - " + eSubject.getEndHour());

	// Adds each day the subject is given
	$.each(eSubject.days, function(iDay, eDay) {
		$groupCard.find(".days").append(Days[eDay].substring(0, 2));
		// If it's not the last day, append a comma
		if(iDay !== (eSubject.days.length - 1)) {
			$groupCard.find(".days").append(", ");
		}
	});

	if (isOverlapping(eSubject)) {
		$groupCard.addClass('overlap');
	}

	if (eSubject.isFull()) {
		$groupCard.addClass('closed');
	}
	else {
		$groupCard.addClass('open');
		$groupCard.attr('href', '#subjectsTab');
		$groupCard.attr('aria-controls', 'subjectsTab');
	}

	return $groupCard;
}

/*

DIVIDES ALL SUBJECTS BY TYPE AND PRINT THEM SUBJECTS CARDS FOR SELECTION

*/

function printSubjectCards(arrSubjects, $subjectCardOriginal) {
	// Sort the subjects by type, priority or by alphabetic order
	arrSubjects.sort(function(a, b){
		if(a.type < b.type) { // Sort types alphabetical
			return -1;
		}
		else if(a.type > b.type) { // Sort types alphabetical
			return 1;
		}
		else if (a.priority === b.priority) { // If type is the same, verify priority
			 // Sort alphabetical by name
			if(a.name < b.name) {
				return -1;
			}
			else if (a.name > b.name) {
				return 1;
			}
			else {
				return 0;
			}
		}
		else { // Sort priority
			return a.priority - b.priority;
		}
	});

	// Different types of subjects
	var arrSubjectTypes = ["academic", "sports", "cultural", "student"];
	var iTypesPointer = 0;  // Pointer to trim the subjects array for each type

	arrSubjectTypes.sort(); // Sort the types to match the sorted array of subjects

	$.each(arrSubjectTypes, function(iType, eType){ // Iterate through every type of subject
		var iPastPointer = iTypesPointer; // Store the first value of type
		while((iTypesPointer < arrSubjects.length) && (arrSubjects[iTypesPointer].type === eType)) { // Get the last subject with specific type
			iTypesPointer++;
		}

		var pastSubject = arrSubjects[iPastPointer]; // Stores the first subject for comparing with the others and count groups
		var iCountGroups = 1; // Counts how many groups of the same subject exist

		if ((iPastPointer + 1) < iTypesPointer) { // Verify if the array has more than one element to compare
			$.each(arrSubjects.slice((iPastPointer + 1), iTypesPointer), function(iSubject, eSubject){ // Iterate over
				if (eSubject.name !== pastSubject.name) { // Print only one course
					if(!pastSubject.hasParentCourse) { // Verify if it doesn't have a parent course, to show just parent subjects here					
						$("." + eType + "-body").append(getSubjectCard(pastSubject, $subjectCardOriginal, iCountGroups)); // Append the card to the body type
						iCountGroups++;
					}

					pastSubject = eSubject; // Set the new subject as it was different from the past element
					iCountGroups = 1;
				}
			});
			// Append the last subject that didn't print in the loop
			if(!pastSubject.hasParentCourse) { // Verify if it doesn't have a parent course, to show just parent subjects here					
				$("." + eType + "-body").append(getSubjectCard(pastSubject, $subjectCardOriginal, iCountGroups)); // Append the card to the body type
			}
		}
		else if ((iPastPointer + 1) === iTypesPointer) { // If it has one element, just print that subject with 1 group
			// Append the only element of the array
			if(!pastSubject.hasParentCourse) { // Verify if it doesn't have a parent course, to show just parent subjects here					
				$("." + eType + "-body").append(getSubjectCard(pastSubject, $subjectCardOriginal, iCountGroups)); // Append the card to the body type
			}
		}
	});
}

/*

CLICK EVENT FOR SUBJECTS WITH CHILD COURSES

*/

function printCourseCards(arrSubjects, sSubject, $courseCardOriginal) {
	$(".courses-body").empty(); // Clear the body of past prints
	$(".courses-body").append("<h3>" + sSubject + "</h3>"); // Display the name of the subject as a title
	$(".courses-body").append("<h4 class='nav-title'>Cursos</h4>"); // Display the name of the current tab

	// This should retourn an array of 1 element, beacuse the subject must be only one time
	var arrChildrenCourses = $.grep(arrSubjects, function(eSubject){
		return eSubject.name === sSubject;
	})[0].childrenCourses;

	$.each(arrChildrenCourses, function(index, val) {
		var arrChildCourse = $.grep(arrSubjects, function(eSubject) {
			return eSubject.name === val;
		});

		$(".courses-body").append(getSubjectCard(arrChildCourse[0], $courseCardOriginal, arrChildCourse.length));


	});

}

/*

CLICK EVENT FOR SHOWING GROUPS OF A SUBJECT

*/

function printGroupCards(arrSubjects, sSubject, $groupCardOriginal) {
	$(".groups-body").empty(); // Clear the body of past prints
	$(".groups-body").append("<h3>" + sSubject + "</h3>"); // Display the name of the subject as a title
	$(".groups-body").append("<h4 class='nav-title'>Grupos</h4>"); // Display the name of the current tab

	// This should retourn an array of all groups of that subject
	var arrGroupsOfSubject = $.grep(arrSubjects, function(eSubject){
		return eSubject.name === sSubject;
	});

	// Print every card of the groups
	$.each(arrGroupsOfSubject, function(index, val) {
		$(".groups-body").append(getGroupCard(val, $groupCardOriginal, 0));
	});

}

// Define here variables, for next functions to not crash
var arrAcademics = [];
var arrSubjects = [];

var $summaryCardOriginal; // Summary card template
var $subjectCardOriginal; // Subjects card template
var $courseCardOriginal;  // Course card template
var $groupCardOriginal; // Group card template

$(document).ready(function() {
	// Gets the template of the summary card and deletes it
	$summaryCardOriginal = $(".summary-card").clone(true);
	$(".summary-card").remove();

	// Gets the template of the subject card and deletes it
	$subjectCardOriginal = $(".subject-card").clone(true);
	$(".subject-card").remove();

	// Gets the template of the course card and deletes it
	$courseCardOriginal = $(".course-card").clone(true);
	$(".course-card").remove();

	// Gets the template of the group card and deletes it
	$groupCardOriginal = $(".group-card").clone(true);
	$(".group-card").remove();

	/*
		Function when a subject is sent to courses
	 */
	$("body").on('click', '.to-courses', [$courseCardOriginal], function(event) {
		var sSubject = $(this).find(".subject-title").text();
		printCourseCards(arrAcademics, sSubject, event.data[0]);
	});

	/*
		Function when a subject is sent to groups
	 */
	$("body").on('click', '.to-groups', [$groupCardOriginal], function(event) {
		var sSubject = $(this).find(".subject-title").text();
		printGroupCards(arrAcademics, sSubject, event.data[0]);
	});
});





