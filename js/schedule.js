// Gets formated hour by dividing by 100, and adds two zeros if necessary.
// Hour is in format HHMM as integer
function formattedHour(hour) {
	return Math.floor(hour / 100) + ":" + ((hour % 100 === 0) ? "00" : (hour % 100));
}

// Arrays of colors classes, schedule hours and days
function Colors() {
	this.colors = ["bgm-blue", "bgm-purple", "bgm-bluegray", "bgm-lightgreen", "bgm-teal", "bgm-deeppurple", "bgm-deeporange", "bgm-amber",  "bgm-cyan", "bgm-lime", "bgm-green", "bgm-indigo",  "bgm-orange", "bgm-black", "bgm-brown", "bgm-yellow", "bgm-gray"];
	this.pointer = 0;
	this.getColor = function() {
		return this.colors[this.pointer];
	};
	this.advancePointer = function() {
		this.pointer++;
		if (this.pointer == this.colors.length) {
			this.pointer = 0;
		}
	};
}
var eColors = new Colors();
var arrHours = [700, 730, 800, 830, 900, 930, 1000, 1030, 1100, 1130, 1200, 1230, 1300, 1330, 1400, 1430, 1500, 1530, 1600, 1630, 1700, 1730, 1800, 1830, 1900, 1930, 2000, 2030, 2100];
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
function Subject(iID, iName, sCode, arrDays, iStart, iDuration, arrTeachers, sBuilding, sClassroom, arrOptions, sCourseDate, iPriority, sType, arrChildrenCourses, bHasParentCourse, sParentCourse, iUnits, iCapacity, iStudentsRegistered) {
	this.id = iID;
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
	this.capacity = iCapacity;
	this.studentsRegistered = iStudentsRegistered;
	this.color = "";
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
	};
}

/*

ASSIGN COLORS TO SUBJECTS

 */

function assignColors() {
	$.each(arrSubjects, function(iSubject, eSubject) {
		eSubject.color = eColors.getColor();
		eColors.advancePointer();
	})
}

/*

PRINTS SCHEDULE AT HOME

 */

function printScheduleHome() {
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
										arrSubjects[iCountSubjects].color + "' rowspan='" + arrSubjects[iCountSubjects].duration + "'>" + 
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

function printScheduleAtSelection() {
	var $schedule = $scheduleAtSelectionOriginal.clone(true);
	$("#scheduleAtSelection").remove();

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
									arrSubjects[iCountSubjects].color + "' rowspan='" + arrSubjects[iCountSubjects].duration + "'>" + 
									arrSubjects[iCountSubjects].name + "</td>";
						bSubjectFound = true;
					}
					// If it's found, but it's not the first instance, it should not print anything because of the rowspan of the first occurence
					else if(arrSubjects[iCountSubjects].getHalfHoursPeriod().indexOf(eHour) > 0) {
						bSubjectFound = true;
					}

					// If it's the last cell of a subject, adds one to subjects pointer
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
		// $("#scheduleAtSelection tbody").append(sCellText); // Apend the <tr> to the body
		$schedule.find("tbody").append(sCellText); // Apend the <tr> to the body

	});

	$("#schedule-col .table-responsive").append($schedule);
	resizeScheduleSelectionCols();
	updateUnits();
	return $schedule;
}

/*

GETS SUMMARY LIST

 */

function getSummaryList($summaryList, eSubject) {
	// Adds each teacher of the subject
	$.each(eSubject.teachers, function(iTeacher, eTeacher) {
		$summaryList.find(".teachers").append(eTeacher);
		// If it's not the last teacher, append a break
		if(iTeacher !== (eSubject.teachers.length - 1)) {
			$summaryList.find(".teachers").append("<br>");
		}
	});

	$summaryList.find(".date").append(eSubject.courseDate);

	// Adds each day the subject is given
	$.each(eSubject.days, function(iDay, eDay) {
		$summaryList.find(".class-schedule").append(Days[eDay]);
		// If it's not the last day, append a comma
		if(iDay !== (eSubject.days.length - 1)) {
			$summaryList.find(".class-schedule").append(", ");
		}
	});

	// Adds start and end hour
	$summaryList.find(".class-schedule").append(" " + eSubject.getStartHour() + " - " + eSubject.getEndHour());

	// Adds building and classroom
	$summaryList.find(".building-classroom").append(eSubject.building + " " + eSubject.classroom);

	// Verify if the class has options
	if (eSubject.options.length) {
		// Add extra attributes of class
		$.each(eSubject.options, function(iOption, eOption) {
			$summaryList.find(".options").append(eOption);
			// If it's not the last option, append a break
			if(iOption !== (eSubject.options.length - 1)) {
				$summaryList.find(".options").append("<br>");
			}
		});
	}
	else {
		$summaryList.find(".options").parent().remove();
	}

	// Verify if the class has parent course
	if (eSubject.hasParentCourse) {
		$summaryList.find(".parent-course").append(eSubject.parentCourse);
	}
	else {
		$summaryList.find(".parent-course").parent().remove();
	}
}


/*

PRINTS SUMMARY

 */

function printSummary() {
	$(".summary").empty(); // Clears the DOM object

	$.each(arrSubjects, function(iSubject, eSubject) {
		var $summaryCard = $summaryCardOriginal.clone(true); // Clones the original to not modifying it

		// Add color, code and name to the header
		$summaryCard.find(".card-header").addClass(eSubject.color);
		$summaryCard.find(".card-header h2").append(eSubject.code + " " + eSubject.name);
		
		getSummaryList($summaryCard.find(".summary-list"), eSubject);

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
	var bOverlaps = false;
	$.each(eSubject.getHalfHoursPeriod(), function(iHour, eHour){
		if (!bOverlaps) {
			$.each(eSubject.days, function(iDay, eDay) {
				if (!$("." + eDay + ".h-" + eHour + ":empty").length) {
					bOverlaps = true;
					return false;
				}
			});
		}
		else {
			return false;
		}
	});

	return bOverlaps;
}

/*

VERIFY IF THE CLASS OVERLAPS WITH SOME OTHER CLASS EXCEPT THE ONE IN THE SECOND PARAMETER

 */
function isOverlappingExceptItself(eSubject) {
	var bOverlaps = false;
	$.each(eSubject.getHalfHoursPeriod(), function(iHour, eHour){ // Iterate over each half hour period
		if (!bOverlaps) {
			$.each(eSubject.days, function(iDay, eDay) { // On each day
				if (!$("." + eDay + ".h-" + eHour + ":empty").length) { // Verify if the cell is not empty
					var eCurrentSubject;

					if ($("." + eDay + ".h-" + eHour).length) { // Verify if the cell exist
						eCurrentSubject = $.grep(arrSubjects, function(element) {
				    		return element.name == $("." + eDay + ".h-" + eHour).text();
				    	})[0]; // Gets the object of the subject in the cell

						if (eSubject.name !== eCurrentSubject.name && !eSubject.hasParentCourse) { // Verify if the names are different and the subject don't have a parent course
							bOverlaps = true;
							return false;
						}
						else if(eSubject.name !== eCurrentSubject.name && eSubject.hasParentCourse && eSubject.parentCourse !== eCurrentSubject.parentCourse) { // Verify that neither the name or the parent course overlap
							bOverlaps = true;
							return false;
						}
					}
					else {
						var iPointerHour = arrHours.indexOf(eHour) - 1;

						while(!$("." + eDay + ".h-" + arrHours[iPointerHour]).length) { // Iterate until it's found a cell with content
							iPointerHour--;
						}

						eCurrentSubject = $.grep(arrSubjects, function(element) {
				    		return element.name == $("." + eDay + ".h-" + arrHours[iPointerHour]).text();
				    	})[0]; // Gets the object of the subject in the cell

						if (eSubject.name !== eCurrentSubject.name && !eSubject.hasParentCourse) { // Verify if the names are different and the subject don't have a parent course
							bOverlaps = true;
							return false;
						}
						else if(eSubject.name !== eCurrentSubject.name && eSubject.hasParentCourse && eSubject.parentCourse !== eCurrentSubject.parentCourse) { // Verify that neither the name or the parent course overlap
							bOverlaps = true;
							return false;
						}
					}
				}
			});
		}
		else {
			return false;
		}
	});

	return bOverlaps;
}

/*

VERIFY IF THE CLASS OVERLAPS WITH SOME OTHER CLASS EXCEPT THE ONE IN THE SECOND PARAMETER

 */
function overlapsWith(eSubject) {
	var bOverlaps = false;
	var sOverlapsWith;
	$.each(eSubject.getHalfHoursPeriod(), function(iHour, eHour){ // Iterate over each half hour period
		if (!bOverlaps) {
			$.each(eSubject.days, function(iDay, eDay) { // On each day
				if (!$("." + eDay + ".h-" + eHour + ":empty").length) { // Verify if the cell is not empty
					var eCurrentSubject;

					if ($("." + eDay + ".h-" + eHour).length) { // Verify if the cell exist
						bOverlaps = true;
						sOverlapsWith = $("." + eDay + ".h-" + eHour).text(); // Get the name of the subject
						return false;
					}
					else {
						var iPointerHour = arrHours.indexOf(eHour) - 1;

						while(!$("." + eDay + ".h-" + arrHours[iPointerHour]).length) { // Iterate until it's found a cell with content
							iPointerHour--;
						}

						bOverlaps = true;
						sOverlapsWith = $("." + eDay + ".h-" + arrHours[iPointerHour]).text(); // Get the name of the subject
						return false;
					}
				}
			});
		}
		else {
			return false;
		}
	});

	return sOverlapsWith;
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
		// The following line is to print the courses number of the subject
		// $subjectCard.find(".material-list").first().append("<li><p class='element courses-num'>" + eSubject.childrenCourses.length + "</p><p class='description'>Cursos</p></li>");
		$subjectCard.attr('href', '#coursesTab');
		$subjectCard.attr('aria-controls', 'coursesTab');
		$subjectCard.addClass('to-courses');
	}
	// If the subject has no children courses, make the link direct to groups tab
	else {
		// The following line is to print the groups number of the subject
		// $subjectCard.find(".material-list").first().append("<li><p class='element groups-num'>" + iGroupsNum + "</p><p class='description'>Grupos</p></li>");
		$subjectCard.attr('href', '#groupsTab');
		$subjectCard.attr('aria-controls', 'groupsTab');
		$subjectCard.addClass('to-groups');
	}

	return $subjectCard;
}

/*

GETS SINGLE GROUP CARD

 */

function getGroupCard(eSubject) {
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

	if (groupIsSelected(eSubject.id)) { // Verify if the current subject is already selected
		$groupCard.addClass('selected');
		$groupCard.attr('href', '#subjectsTab'); // If the group is opened, it gives the link to the schedule in case it's selected
		$groupCard.attr('aria-controls', 'subjectsTab');
	}
	else if (courseIsSelected(eSubject.name) || subjectIsSelected(eSubject.parentCourse)) { // Verify if the current subject is already selected to don't overlap with existing
		if (isOverlappingExceptItself(eSubject) && eSubject.isFull()) { // Verify if it's overlaping with other subjects and it's closed
			$groupCard.addClass('overlap');
			$groupCard.addClass('closed');
		}
		// Verify if the current subject overlaps with another that is already in the schedule but it's opened
		else if (isOverlappingExceptItself(eSubject) && !eSubject.isFull()) {
			$groupCard.addClass('overlap');
			$groupCard.addClass('open');
		}
		// Verify if the current subject is closed
		else if (eSubject.isFull()) {
			$groupCard.addClass('closed');
		}
		// Verify if the current subject is open but has special attributes
		else if (eSubject.options.length) {
			$groupCard.addClass('open');
			$groupCard.addClass('special-attributes');
		}
		// Verify if the current subject is open and don't overlaps
		else {
			$groupCard.addClass('open');
			$groupCard.attr('href', '#subjectsTab'); // If the group is opened, it gives the link to the schedule in case it's selected
			$groupCard.attr('aria-controls', 'subjectsTab');
		}
		$groupCard.addClass('current-subject'); // Add an indentifier for hovering
	}
	// Verify if the current subject overlaps with another that is already in the schedule and it's closed
	else if (isOverlapping(eSubject) && eSubject.isFull()) {
		$groupCard.addClass('overlap');
		$groupCard.addClass('closed');
	}
	// Verify if the current subject overlaps with another that is already in the schedule but it's opened
	else if (isOverlapping(eSubject) && !eSubject.isFull()) {
		$groupCard.addClass('overlap');
		$groupCard.addClass('open');
	}
	// Verify if the current subject is closed
	else if (eSubject.isFull()) {
		$groupCard.addClass('closed');
	}
	// Verify if the current subject is open but has special attributes
	else if (eSubject.options.length) {
		$groupCard.addClass('open');
		$groupCard.addClass('special-attributes');
	}
	// Verify if the current subject is open and don't overlaps
	else {
		$groupCard.addClass('open');
		$groupCard.attr('href', '#subjectsTab'); // If the group is opened, it gives the link to the schedule in case it's selected
		$groupCard.attr('aria-controls', 'subjectsTab');
	}

	// Add the id as value to get the object later
	$groupCard.attr("value", eSubject.id);

	return $groupCard;
}

/*

REMOVES THE CLASS SELECTED AND REMOVES THE OBJECT FROM THE ARRAY OF SUBJECTS OF THE USER IF THE SCHEDULE WAS ALREADY SELECTED

*/

function removeSelected(eSubjectCurrent) {
    $.each(arrSubjects, function(iSubject, eSubject) { // For each subject of the user
    	if (eSubject.name === eSubjectCurrent.name || (eSubjectCurrent.hasParentCourse && eSubject.parentCourse === eSubjectCurrent.parentCourse)) { // Identify the selected one
    		$(".subject-card").each(function() {
		    	// Remove selected class to the card at home of the subject or parent Subject
		    	if ($(this).find('.subject-title').text() === eSubject.name || $(this).find('.subject-title').text() === eSubject.parentCourse) {
		    		$(this).removeClass('selected');
		    		return false;
		    	}
		    });
    		arrSubjects.splice(iSubject, 1); // Remove the subject from the array
    		return false;
    	}
    });
    $scheduleAtSelectionCurrent = printScheduleAtSelection(); // Print the new schedule and store it
	printSummary(); // Print the new summary
}

/*

Verifies if the specific groups is already selected

*/

function groupIsSelected(iId) {
	var arrSelected = $.grep(arrSubjects, function(eSubject){
		return eSubject.id === iId;
	});
	return arrSelected.length;
}

/*

Verifies if there is another subject of the same course selected

*/

function courseIsSelected(sCourseName) {
	var arrSelected = $.grep(arrSubjects, function(eSubject){
		return eSubject.name === sCourseName;
	});

	return arrSelected.length;
}

/*

Verifies if there is another subject of the same parent course selected

*/

function subjectIsSelected(sParentCourse) {
	var arrSelected = $.grep(arrSubjects, function(eSubject){
		return eSubject.hasParentCourse && eSubject.parentCourse === sParentCourse;
	});

	return arrSelected.length;
}

/*

DIVIDES ALL SUBJECTS BY TYPE AND PRINT THEM SUBJECTS CARDS FOR SELECTION

*/

function printSubjectCards() {
	// Sort the subjects by type, priority or by alphabetic order
	arrGlobalSubjects.sort(function(a, b){
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
		while((iTypesPointer < arrGlobalSubjects.length) && (arrGlobalSubjects[iTypesPointer].type === eType)) { // Get the last subject with specific type
			iTypesPointer++;
		}

		var pastSubject = arrGlobalSubjects[iPastPointer]; // Stores the first subject for comparing with the others and count groups
		var iCountGroups = 1; // Counts how many groups of the same subject exist

		if ((iPastPointer + 1) < iTypesPointer) { // Verify if the array has more than one element to compare
			arrGlobalSubjects[iPastPointer].color = eColors.getColor(); // Add the color to the first subject

			$.each(arrGlobalSubjects.slice((iPastPointer + 1), iTypesPointer), function(iSubject, eSubject){ // Iterate over
				if (eSubject.name !== pastSubject.name) { // Print only one course
					if(!pastSubject.hasParentCourse) { // Verify if it doesn't have a parent course, to show just parent subjects here
						$("." + eType + "-body").append(getSubjectCard(pastSubject, $subjectCardOriginal, iCountGroups)); // Append the card to the body type
						iCountGroups++;
					}
					eColors.advancePointer(); // Advance the pointer of the colors as it is a new subject
					pastSubject = eSubject; // Set the new subject as it was different from the past element
					iCountGroups = 1;
				}

				eSubject.color = eColors.getColor(); // Add the color to the current object
			});
			// Append the last subject that didn't print in the loop
			if(!pastSubject.hasParentCourse) { // Verify if it doesn't have a parent course, to show just parent subjects here
				$("." + eType + "-body").append(getSubjectCard(pastSubject, $subjectCardOriginal, iCountGroups)); // Append the card to the body type
			}
			eColors.advancePointer(); // Advance the pointer of the colors as it is a new subject
		}
		else if ((iPastPointer + 1) === iTypesPointer) { // If it has one element, just print that subject with 1 group
			// Append the only element of the array
			if(!pastSubject.hasParentCourse) { // Verify if it doesn't have a parent course, to show just parent subjects here					
				$("." + eType + "-body").append(getSubjectCard(pastSubject, $subjectCardOriginal, iCountGroups)); // Append the card to the body type
			}
			eColors.advancePointer();
		}
	});
}

/*

CLICK EVENT FOR SUBJECTS WITH CHILD COURSES

*/

function printCourseCards(sSubject) {
	$(".courses-body .panel-group").empty(); // Clear the body of past prints
	$(".courses-body h3").text(sSubject); // Display the name of the subject as a title

	// Find the subject, this should return an array of 1 element, beacuse the subject must be only one time. Then get it's children courses
	var arrChildrenCourses = $.grep(arrGlobalSubjects, function(eSubject){
		return eSubject.name === sSubject;
	})[0].childrenCourses;

	var iCountSubjects = 0; // Counter to set unique id's of the accordions

	$.each(arrChildrenCourses, function(index, eCourseName) { // For each children course
		var arrChildCourse = $.grep(arrGlobalSubjects, function(eSubject) { // Find all the groups 
			return eSubject.name === eCourseName;
		});

		var $courseAccordion = $courseAccordionOriginal.clone(true); // Get a copy of the accordion item

		// Add properties for the accordion to work well
		$courseAccordion.find('.panel-heading').attr("id", "courseHeading" + iCountSubjects);
		$courseAccordion.find('a').attr("href", "#course" + iCountSubjects);
		$courseAccordion.find('a').attr("aria-controls", "course" + iCountSubjects);
		$courseAccordion.find('a').append(eCourseName); // Add course name to the title
		$courseAccordion.find('.collapse').attr("id", "course" + iCountSubjects);
		$courseAccordion.find('.collapse').attr("aria-labelledby", "courseHeading" + iCountSubjects);

		$.each(arrChildCourse, function(iCourse, eCourse) { // Set each children course it's parent course
			eCourse.parentCourse = sSubject;
			$courseAccordion.find(".panel-body").append(getGroupCard(eCourse));
		});
		$(".courses-body .panel-group").append($courseAccordion); // Print it
		iCountSubjects++;
	});
}

/*

CLICK EVENT FOR SHOWING GROUPS OF A SUBJECT

*/

function printGroupCards(sSubject, bCourses) {
	$(".groups-body").empty(); // Clear the body of past prints
	$(".groups-body").append("<h3>" + sSubject + "</h3>"); // Display the name of the subject as a title
	$(".groups-body").append("<h4 class='nav-title'>Grupos</h4>"); // Display the name of the current tab

	// This should retourn an array of all groups of that subject
	var arrGroupsOfSubject = $.grep(arrGlobalSubjects, function(eSubject){
		return eSubject.name === sSubject;
	});

	// Print every card of the groups
	$.each(arrGroupsOfSubject, function(index, eSubject) {
		$(".groups-body").append(getGroupCard(eSubject));
	});

	if (bCourses) {
		$(".groups-body").append("<a href='#coursesTab' aria-controls='coursesTab' class='btn btn-success btn-block waves-effect back-btn' role='tab' data-toggle='tab'>Regresar a Cursos</button>");
	}
	$(".groups-body").append("<a href='#subjectsTab' aria-controls='subjectsTab' class='btn btn-info btn-block waves-effect back-btn' role='tab' data-toggle='tab'>Regresar a Materias</button>");

}

/*

RESIZE INFO COLUMN TO BE EQUAL AS SCHEDULE

 */

function resizeScheduleSelectionCols() {
	var iHeight = document.getElementById("schedule-col-inner").scrollHeight;
	$("#cardScheduleSelection").height(iHeight);
}

/*

Add new subject to the User array and add selected class to card

*/

function addSubjectToCurrentArray(eSubject) {
	$(".subject-card").each(function() {
    	// Add selected class to the card at home
    	if ($(this).find('.subject-title').text() === eSubject.name || $(this).find('.subject-title').text() === eSubject.parentCourse) {
    		$(this).addClass('selected');
    		return false;
    	}
    });

	arrSubjects.push(eSubject); // Add the group to the current user array
	$scheduleAtSelectionCurrent = printScheduleAtSelection(); // Print the new schedule and store it
	printSummary(); // Print the new summary
}

/*

Update units signs

*/

function updateUnits(){
	var iSum = 0;
	$.each(arrSubjects, function(iSubject, eSubject) {
		iSum += eSubject.units;
	})
	$("#registeredUnits").html(iSum);
}

/*

Verify if there's still space to sign in the unit groups

*/

function verifyUnits(iUnits) {
	var iCurrentSum = 0;
	var iLimitUnits = parseInt($("#limitUnits").text());

	$.each(arrSubjects, function(iSubject, eSubject) {
		iCurrentSum += eSubject.units;
	})
	return iCurrentSum + iUnits <= iLimitUnits;
}

/*

Timer

*/

function timer(iDuration, $timer) {
    var iTimer = iDuration, iMinutes, iSeconds;

    setInterval(function () {
        iMinutes = parseInt(iTimer / 60, 10)
        iSeconds = parseInt(iTimer % 60, 10);

        iMinutes = iMinutes < 10 ? "0" + iMinutes : iMinutes;
        iSeconds = iSeconds < 10 ? "0" + iSeconds : iSeconds;

        $timer.text(iMinutes + ":" + iSeconds);

        if (--iTimer < 0) { // Notifies and redirects the user when time is over
        	$timer.text("00:00");
            swal({   
	            title: "Upps! Se ha agotado tu tiempo",   
	            text: "Tu sesión ha finalizado, por favor reintenta.",   
	            type: "error",
	            confirmButtonColor: '#2196f3'
	        }, function(){   
	        	location.assign("index.html");
	        });
        }
        else if(iTimer === (iDuration / 2) - 1) { // Changes from green to yellow at 15 minutes
        	$timer.removeClass('c-green');
        	$timer.addClass('c-amber');
        }
        else if(iTimer === (iDuration / 6) - 1) {
        	$timer.removeClass('c-amber');
        	$timer.addClass('c-red');
        	console.log(1);
        	notify(undefined, undefined, undefined, "inverse", "animated bounceInUp", "animated bounceOutUp"); // Notifies the user that has 5 minutes left
        }
    }, 1000);
}

/*
 * Notifications
 */

function notify(from, align, icon, type, animIn, animOut){
    $.growl({
        icon: icon,
        title: ' ¡Apresurate! ',
        message: 'Solo te quedan 5 minutos para finalizar tu horario',
        url: ''
    },{
            element: 'body',
            type: type,
            allow_dismiss: true,
            placement: {
                    from: from,
                    align: align
            },
            offset: {
                x: 20,
                y: 85
            },
            spacing: 10,
            z_index: 1031,
            delay: 2500,
            timer: 2000,
            url_target: '_blank',
            mouse_over: false,
            animate: {
                    enter: animIn,
                    exit: animOut
            },
            icon_type: 'class',
            template: '<div data-growl="container" class="alert" role="alert">' +
                            '<button type="button" class="close" data-growl="dismiss">' +
                                '<span aria-hidden="true">&times;</span>' +
                                '<span class="sr-only">Close</span>' +
                            '</button>' +
                            '<span data-growl="icon"></span>' +
                            '<span data-growl="title"></span>' +
                            '<span data-growl="message"></span>' +
                            '<a href="#" data-growl="url"></a>' +
                        '</div>'
    });
};

// Define here variables, for next functions to not crash
var arrGlobalSubjects = []; // Array for all the subjects registered
var arrSubjects = []; // Array of subjects of the current user
var arrSubjectsTemp = []; // Array of subjects temporary for hover elements of the same subject that is already selected

// Globla variables to handle subject swaping
var eNewSubject;
var ePastSubject;

var $summaryCardOriginal; // Summary card template
var $subjectCardOriginal; // Subjects card template
var $courseAccordionOriginal // Course accordion Template
var $courseCardOriginal;  // Course card template
var $groupCardOriginal; // Group card template
var $summaryListOriginal; // Summary list template
var $scheduleAtSelectionOriginal; // Gets the original DOM object of the schedule
var $scheduleAtSelectionCurrent; // Gets the current DOM object of the schedule

$(document).ready(function() {
	// Gets the template of the summary list and deletes it
	$summaryListOriginal = $(".summary-list").clone(true);

	// Gets the template of the summary card and deletes it
	$summaryCardOriginal = $(".summary-card").clone(true);
	$(".summary-card").remove();

	// Gets the template of the subject card and deletes it
	$subjectCardOriginal = $(".subject-card").clone(true);
	$(".subject-card").remove();

	// Gets the template of the course accordion and deletes it
	$courseAccordionOriginal = $(".accordion-item").clone(true);
	$(".accordion-item").remove();

	// Gets the template of the course card and deletes it
	$courseCardOriginal = $(".course-card").clone(true);
	$(".course-card").remove();

	// Gets the template of the group card and deletes it
	$groupCardOriginal = $(".group-card").clone(true);
	$(".group-card").remove();

	// Gets the template of the original schedule at selection and deletes it
	$scheduleAtSelectionOriginal = $("#scheduleAtSelection").clone(true);
	$("#scheduleAtSelection").remove();

	/*
		Function when a subject is sent to courses
	 */
	$("body").on('click', '.to-courses', function(event) {
		var sSubject = $(this).find(".subject-title").text(); // Get the name of the subject
		printCourseCards(sSubject); // Print it's courses

	});

	/*
		Function when a subject is sent to groups
	 */
	$("body").on('click', '.to-groups', [$groupCardOriginal], function(event) {
		var sSubject = $(this).find(".subject-title").text(); // Get the name of the subject
		if ($(this).hasClass('from-courses')) { // Verify if the card comes from subjects or courses Tab
			printGroupCards(sSubject, true); // Print it's groups
		}
		else {
			printGroupCards(sSubject, false); // Print it's groups
		}
	});

	/*
		Function that handles hover and click events for group-cards to show the preview in the schedule
	 */
	$("body").on({
	    mouseenter: function (event) {
	    	var iValue = parseInt($(this).attr("value")); // Gets the index of the subject in the global array
	    	// Should return an array of 1 element with the specific group
	    	var eSubject = $.grep(arrGlobalSubjects, function(element) {
	    		return element.id == iValue;
	    	})[0];

            if ($(this).hasClass("open")) { // If the group is opened
            	if ($(this).hasClass('current-subject')) {
            		arrSubjectsTemp = arrSubjects.slice();
            		removeSelected(eSubject); // Remove temporary the group of the same subject
            		printScheduleAtSelection(); // Print the new schedule and store it
					printSummary(); // Print the new summary
            	}
            	$.each(eSubject.getHalfHoursPeriod(), function(iHour, eHour){ // For each half hour
					$.each(eSubject.days, function(iDay, eDay) {             // And each day the class is given
						$("." + eDay + ".h-" + eHour).addClass('success');   // Transform the cell green
					});
				});
            }

		    $(".more-info").click(function(event) {
				event.stopPropagation();
				var $summaryList = $summaryListOriginal.clone(true);

				getSummaryList($summaryList, eSubject);

		    	swal({
		    		title: eSubject.name,   
		    		text: $summaryList.wrap('<p/>').parent().html(),   
		    		html: true,
		    		confirmButtonColor: '#2196f3',
		    		customClass: "more-info-alert",
		    		allowOutsideClick: true
		    	});
		    });
		},

	    mouseleave: function () {
            if ($(this).hasClass('current-subject')) {
            	if ($(this).hasClass('open')) {
            		arrSubjects = arrSubjectsTemp.slice();
            	}
            }
            printScheduleAtSelection(); // Prints the schedule before the hover
            printSummary(); // Prints the summary
	    },

        click: function (event) {
        	var iValue = parseInt($(this).attr("value")); // Gets the index of the subject in the global array
            var eSubject = $.grep(arrGlobalSubjects, function(element) { // Get the subject object
	    		return element.id == iValue;
	    	})[0];

            if ($(this).hasClass("open") && !$(this).hasClass("special-attributes")) { // Verify if the group is opened
		    	if (verifyUnits(eSubject.units)) {
		    		if (groupIsSelected(eSubject.id) || courseIsSelected(eSubject.name) || subjectIsSelected(eSubject.parentCourse)) {
			    		removeSelected(eSubject); // Remove another group of the same course or subject if needed
			    	}

		            addSubjectToCurrentArray(eSubject);

			    	if ($(this).hasClass('current-subject')) {
		            	$(this).removeClass('current-subject');
		            }
		    	}
		    	else {
		    		swal("Error", "Has rebasado tus unidades límites de inscripción. Revisa tus materias.", "error"); 
		    	}
            }
            else if ($(this).hasClass("open") && $(this).hasClass("special-attributes")) { // Verify if the group is opened and has special attributes
            	if (verifyUnits(eSubject.units)) {
            		eNewSubject = eSubject; // Copy the current subject to a global variable
	            	swal({   
					    title: "¿Estás seguro que quieres inscibir esta materia?",   
					    text: "La materia <b>" + eNewSubject.name + "</b> tiene los siguientes atributos: <b>" + eNewSubject.options.join(", ") + "</b>.",   
					    type: "warning",
					    html: true, 
					    showCancelButton: true,   
					    confirmButtonColor: "#25AF30",   
					    confirmButtonText: "Si, inscibir",
					    cancelButtonText: "Regresar",   
					    closeOnConfirm: true 
					}, function(){   
					    if (groupIsSelected(eNewSubject.id) || courseIsSelected(eNewSubject.name) || subjectIsSelected(eNewSubject.parentCourse)) {
							removeSelected(eNewSubject); // Remove another group of the same course or subject if needed
						}

					    addSubjectToCurrentArray(eNewSubject); // Adds the subject to the current array and add selected class to card

						if ($(".group-card[value='" + eNewSubject.id + "']").hasClass('current-subject')) {
					    	$(".group-card[value='" + eNewSubject.id + "']").removeClass('current-subject');
					    }
					    $("#groupsTab").removeClass('active');
	        			$("#subjectsTab").addClass('active');
					});
            	}
            	else {
            		swal("Error", "Has rebasado tus unidades límites de inscripción. Revisa tus materias.", "error"); 
            	}
            }
            else if($(this).hasClass("selected")) {
		    	removeSelected(eSubject); // Remove another group of the same course or subject if needed
            }
        }
	}, ".group-card:not('.overlap')");

	/*
		Function that handles hover and click events for group-cards to show the preview in the schedule
	 */
	$("body").on({
	    mouseenter: function (event) {
	    	var iValue = parseInt($(this).attr("value")); // Gets the index of the subject in the global array
	    	// Should return an array of 1 element with the specific group
	    	var eSubject = $.grep(arrGlobalSubjects, function(element) {
	    		return element.id == iValue;
	    	})[0];

            $.each(eSubject.days, function(iDay, eDay) {             // And each day the class is given
				$.each(eSubject.getHalfHoursPeriod(), function(iHour, eHour){ // For each half hour
					if ($("." + eDay + ".h-" + eHour + ":empty").length) {
						$("." + eDay + ".h-" + eHour).addClass('danger');   // Transform the cell red
					}
					else if ($("." + eDay + ".h-" + eHour).length) {
						if (!$("." + eDay + ".h-" + eHour).hasClass('hover-overlap')) { // If it hasn't been transformed
							$("." + eDay + ".h-" + eHour).addClass('hover-overlap');   // Transform the cell red
						}
					}
					else {
						var iHourPointer = arrHours.indexOf(eHour) - 1;
						while(!$("." + eDay + ".h-" + arrHours[iHourPointer]).length) {
							iHourPointer--;
						}
						if (!$("." + eDay + ".h-" + arrHours[iHourPointer]).hasClass('hover-overlap')) { // If it hasn't been transformed
							$("." + eDay + ".h-" + arrHours[iHourPointer]).addClass('hover-overlap');   // Transform the cell red
						}
					}
				});
			});

			$(".more-info").click(function(event) {
				event.stopPropagation();
				var $summaryList = $summaryListOriginal.clone(true);

				getSummaryList($summaryList, eSubject);

		    	swal({
		    		title: eSubject.name,   
		    		text: $summaryList.wrap('<p/>').parent().html(),   
		    		html: true,
		    		confirmButtonColor: '#2196f3',
		    		customClass: "more-info-alert",
		    		allowOutsideClick: true
		    	});
		    });
		},

	    mouseleave: function () {
            printScheduleAtSelection(); // Prints the schedule before the hover
	    },

        click: function (event) {
        	var iValue = parseInt($(this).attr("value")); // Gets the index of the subject in the global array

            eNewSubject = $.grep(arrGlobalSubjects, function(element) { // Get the subject object
	    		return element.id === iValue;
	    	})[0];

	    	var sPastSubject = overlapsWith(eNewSubject); // Gets the subject that's overlapping

	    	ePastSubject = $.grep(arrSubjects, function(element) {
	    		return element.name === sPastSubject;
	    	})[0];

	    	if (verifyUnits(eNewSubject.units)) {
	    		swal({   
		            title: "¿Estás seguro que quieres reemplazar esta materia?",   
		            text: "Cambiarás del grupo <b>" + ePastSubject.name + "</b> con <b>" + ePastSubject.teachers[0] + "</b> , al grupo <b>" + eNewSubject.name + "</b> con <b>" + eNewSubject.teachers[0] + "</b>.",   
		            type: "warning",
		            html: true,
		            showCancelButton: true,   
		            confirmButtonColor: "#25AF30",   
		            confirmButtonText: "Si, reemplazar",
		            cancelButtonText: "Regresar",   
		            closeOnConfirm: false 
		        }, function(){
		        	console.log(1);
		        	swal({   
					    title: "¿Estás seguro que quieres inscibir esta materia?",   
					    text: "La materia <b>" + eNewSubject.name + "</b> tiene los siguientes atributos: <b>" + eNewSubject.options.join(", ") + "</b>.",   
					    type: "warning",
					    html: true, 
					    showCancelButton: true,   
					    confirmButtonColor: "#25AF30",   
					    confirmButtonText: "Si, inscibir",
					    cancelButtonText: "Regresar",   
					    closeOnConfirm: true 
					}, function(){   
					    removeSelected(ePastSubject);
			            addSubjectToCurrentArray(eNewSubject);

				    	$("#groupsTab").removeClass('active');
		        		$("#subjectsTab").addClass('active');
					});  
		        });
	    	}
	    	else {
	    		swal("Error", "Has rebasado tus unidades límites de inscripción. Revisa tus materias.", "error"); 
	    	}
        }
            
	}, ".group-card.overlap");

	/*
		Function to show the alert of the exit
	 */
	$('.exit-warning').click(function(){
        swal({   
            title: "¿Estás seguro que quieres salir?",   
            text: "No se guardarán los cambios",   
            type: "warning",   
            showCancelButton: true,   
            confirmButtonColor: "#DD6B55",   
            confirmButtonText: "Si, deseo salir",
            cancelButtonText: "Regresar",   
            closeOnConfirm: false 
        }, function(){   
        	location.assign("indexFirst.html");
        });
    });
    /*
		Function to show the alert of the exit
	 */
	$('.save-warning').click(function(){
        swal({   
            title: "¿Estás seguro que quieres guardar los cambios?",   
            text: "Has inscrito 6 materias y 48 unidades",   
            type: "success",   
            showCancelButton: true,   
            confirmButtonColor: "#25AF30",   
            confirmButtonText: "Si, guardar",
            cancelButtonText: "Regresar",   
            closeOnConfirm: false 
        }, function(){   
            swal("Horario Guardado", "Tu horario ha sido guardado exitosamente.", "success");
            setTimeout(function() {
            	location.assign("index.html");
            }, 2000);
        });
    });
});





