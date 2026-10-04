const customSelects = [];
const cardSelects = [];
const mealEmojis = {
	'أكل وجبة صحية متنوعة': '🥗',
	'أكل وجبة غير صحية': '🍟',
	'لم يأكل': '🚫',
};
const choiceIcons = {
	'متقن': 'fa-circle-check',
	'إلى حد ما': 'fa-hourglass-half',
	'لم يتقن': 'fa-circle-xmark',
	'شارك': 'fa-circle-check',
	'لم يشارك': 'fa-circle-xmark',
	'أكل وجبة صحية متنوعة': 'fa-leaf',
	'أكل وجبة غير صحية': 'fa-burger',
	'لم يأكل': 'fa-circle-xmark',
};

function formatEvaluation(value) {
	const ratings = {
		'متقن': '★★★ متقن',
		'إلى حد ما': '★★☆ إلى حد ما',
		'لم يتقن': '☆☆☆ لم يتقن',
	};

	return ratings[value] || value;
}

function formatParticipation(value) {
	const participation = {
		'شارك': '★★★ شارك',
		'لم يشارك': '☆☆☆ لم يشارك',
	};

	return participation[value] || value;
}

function formatMealStatus(value) {
	const mealStatus = {
		'أكل وجبة صحية متنوعة': '★★★ أكل وجبة صحية متنوعة',
		'أكل وجبة غير صحية': '★☆☆ أكل وجبة غير صحية',
		'لم يأكل': '☆☆☆ لم يأكل',
	};

	return mealStatus[value] || value;
}

function closeCustomSelect(customSelect, returnFocus = false) {
	customSelect.wrapper.classList.remove('is-open');
	customSelect.trigger.setAttribute('aria-expanded', 'false');
	customSelect.list.hidden = true;
	customSelect.field.classList.remove('has-open-select');
	if (returnFocus) {
		customSelect.trigger.focus();
	}
}

function openCustomSelect(customSelect, focusOption = false) {
	customSelects.forEach((item) => {
		if (item !== customSelect) {
			closeCustomSelect(item);
		}
	});

	customSelect.wrapper.classList.add('is-open');
	customSelect.trigger.setAttribute('aria-expanded', 'true');
	customSelect.list.hidden = false;
	customSelect.field.classList.add('has-open-select');
	if (focusOption) {
		const selectedOption = customSelect.options.find((option) => option.getAttribute('aria-selected') === 'true');
		(customSelect.options[0] || selectedOption)?.focus();
	}
}

document.querySelectorAll('.field select').forEach((select) => {
	const field = select.closest('.field');
	const label = field.querySelector(`label[for="${select.id}"]`);
	const labelId = `${select.id}-label`;
	const group = document.createElement('div');
	const options = Array.from(select.options).filter((option) => !option.disabled && option.value);
	const buttons = [];
	label.id = labelId;
	label.removeAttribute('for');
	select.classList.add('custom-native-select');
	select.removeAttribute('required');
	select.setAttribute('aria-hidden', 'true');
	select.tabIndex = -1;

	group.className = 'evaluation-choices';
	group.setAttribute('role', 'radiogroup');
	group.setAttribute('aria-labelledby', labelId);
	options.forEach((option, optionIndex) => {
		const button = document.createElement('button');
		const icon = document.createElement('i');
		const check = document.createElement('i');
		button.type = 'button';
		button.className = 'evaluation-choice';
		button.setAttribute('role', 'radio');
		button.setAttribute('aria-checked', String(option.value === select.value));
		button.tabIndex = option.value === select.value || (!select.value && optionIndex === 0) ? 0 : -1;
		button.dataset.value = option.value;
		const iconName = choiceIcons[option.value] || 'fa-circle';
		icon.className = `fa-solid ${iconName} evaluation-choice-icon`;
		icon.setAttribute('aria-hidden', 'true');
		check.className = 'fa-solid fa-check evaluation-choice-check';
		check.setAttribute('aria-hidden', 'true');
		const optionEmoji = select.id === 'meal' ? mealEmojis[option.value] : '';
		button.append(
			icon,
			...(optionEmoji ? [document.createTextNode(`${optionEmoji} `)] : []),
			document.createTextNode(option.textContent.trim()),
			check
		);
		button.classList.toggle('is-selected', option.value === select.value);
		button.addEventListener('click', () => {
			select.value = option.value;
			select.dispatchEvent(new Event('input', { bubbles: true }));
			select.dispatchEvent(new Event('change', { bubbles: true }));
			button.focus();
		});
		button.addEventListener('keydown', (event) => {
			const currentIndex = buttons.indexOf(button);
			let nextIndex = currentIndex;
			if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
				nextIndex = (currentIndex + 1) % buttons.length;
			} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
				nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
			} else if (event.key === 'Home') {
				nextIndex = 0;
			} else if (event.key === 'End') {
				nextIndex = buttons.length - 1;
			} else {
				return;
			}

			event.preventDefault();
			buttons[nextIndex]?.click();
		});
		buttons.push(button);
		group.append(button);
	});

	select.after(group);
	const cardSelect = { select, buttons };
	cardSelects.push(cardSelect);
	select.addEventListener('change', () => {
		buttons.forEach((button) => {
			const selected = button.dataset.value === select.value;
			button.setAttribute('aria-checked', String(selected));
			button.classList.toggle('is-selected', selected);
			button.tabIndex = selected ? 0 : -1;
		});
	});
});

document.querySelectorAll('.field select[data-choice-list]').forEach((select) => {
	const field = select.closest('.field');
	const label = field.querySelector(`label[for="${select.id}"]`);
	const labelId = `${select.id}-label`;
	const triggerId = `${select.id}-trigger`;
	const listId = `${select.id}-options`;
	const wrapper = document.createElement('div');
	const trigger = document.createElement('button');
	const list = document.createElement('div');
	const optionButtons = [];
	const placeholder = select.options[0]?.textContent.trim() || 'اختر';

	label.id = labelId;
	label.htmlFor = triggerId;
	select.classList.add('custom-native-select');
	select.removeAttribute('required');
	select.setAttribute('aria-hidden', 'true');
	select.tabIndex = -1;

	wrapper.className = 'custom-select';
	trigger.id = triggerId;
	trigger.type = 'button';
	trigger.className = 'custom-select-trigger';
	trigger.setAttribute('role', 'combobox');
	trigger.setAttribute('aria-labelledby', labelId);
	trigger.setAttribute('aria-haspopup', 'listbox');
	trigger.setAttribute('aria-expanded', 'false');
	trigger.setAttribute('aria-controls', listId);
	trigger.setAttribute('aria-required', 'true');
	trigger.dataset.placeholder = placeholder;

	const valueText = document.createElement('span');
	valueText.className = 'custom-select-value';
	valueText.textContent = placeholder;
	const arrow = document.createElement('i');
	arrow.className = 'fa-solid fa-chevron-down custom-select-arrow';
	arrow.setAttribute('aria-hidden', 'true');
	trigger.append(valueText, arrow);

	list.id = listId;
	list.className = 'custom-select-options';
	list.setAttribute('role', 'listbox');
	list.setAttribute('aria-labelledby', labelId);
	list.hidden = true;

	Array.from(select.options).forEach((option, optionIndex) => {
		if (option.disabled || !option.value) {
			return;
		}

		const optionButton = document.createElement('button');
		optionButton.type = 'button';
		optionButton.className = 'custom-select-option';
		optionButton.setAttribute('role', 'option');
		optionButton.setAttribute('aria-selected', String(option.value === select.value));
		optionButton.tabIndex = -1;
		optionButton.textContent = option.textContent.trim();
		optionButton.dataset.value = option.value;
		optionButton.addEventListener('click', () => {
			select.value = option.value;
			select.dispatchEvent(new Event('input', { bubbles: true }));
			select.dispatchEvent(new Event('change', { bubbles: true }));
			valueText.textContent = option.textContent.trim();
			trigger.classList.remove('is-placeholder');
			optionButtons.forEach((button) => {
				button.setAttribute('aria-selected', String(button === optionButton));
			});
			closeCustomSelect(customSelect, true);
		});
		optionButton.addEventListener('keydown', (event) => {
			const currentIndex = optionButtons.indexOf(optionButton);
			let nextIndex = currentIndex;

			if (event.key === 'ArrowDown') {
				nextIndex = (currentIndex + 1) % optionButtons.length;
			} else if (event.key === 'ArrowUp') {
				nextIndex = (currentIndex - 1 + optionButtons.length) % optionButtons.length;
			} else if (event.key === 'Home') {
				nextIndex = 0;
			} else if (event.key === 'End') {
				nextIndex = optionButtons.length - 1;
			} else if (event.key === 'Escape') {
				event.preventDefault();
				closeCustomSelect(customSelect, true);
				return;
			} else {
				return;
			}

			event.preventDefault();
			optionButtons[nextIndex]?.focus();
		});
		optionButtons.push(optionButton);
		list.append(optionButton);
	});

	wrapper.append(trigger, list);
	select.after(wrapper);
	trigger.classList.toggle('is-placeholder', !select.value);
	if (select.value) {
		valueText.textContent = select.selectedOptions[0].textContent.trim();
	}

	const customSelect = { select, field, wrapper, trigger, list, options: optionButtons };
	customSelects.push(customSelect);

	trigger.addEventListener('click', () => {
		if (wrapper.classList.contains('is-open')) {
			closeCustomSelect(customSelect);
		} else {
			openCustomSelect(customSelect);
		}
	});
	trigger.addEventListener('keydown', (event) => {
		if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
			event.preventDefault();
			openCustomSelect(customSelect, true);
		}
	});
	select.addEventListener('change', () => {
		const selectedOption = select.selectedOptions[0];
		valueText.textContent = selectedOption?.textContent.trim() || placeholder;
		trigger.classList.toggle('is-placeholder', !select.value);
		optionButtons.forEach((button) => {
			button.setAttribute('aria-selected', String(button.dataset.value === select.value));
		});
	});
});

document.addEventListener('click', (event) => {
	customSelects.forEach((customSelect) => {
		if (!customSelect.wrapper.contains(event.target)) {
			closeCustomSelect(customSelect);
		}
	});
});

document.querySelector('.evaluation-form').addEventListener('submit', (event) => {
	const invalidCardSelect = cardSelects.find(({ select }) => !select.value);
	const invalidSelect = customSelects.find(({ select }) => !select.value);
	if (!invalidCardSelect && !invalidSelect) {
		return;
	}

	event.preventDefault();
	event.stopImmediatePropagation();
	if (invalidCardSelect) {
		invalidCardSelect.buttons[0]?.focus();
	} else {
		openCustomSelect(invalidSelect);
		invalidSelect.trigger.focus();
	}
});

const evaluationForm = document.querySelector('.evaluation-form');

function normalizeSaudiPhone(value) {
	let phone = value.replace(/\D/g, '');

	if (phone.startsWith('00966')) {
		return phone.slice(2);
	}
	if (phone.startsWith('966')) {
		return phone;
	}
	if (phone.startsWith('05')) {
		return `966${phone.slice(1)}`;
	}
	if (phone.startsWith('5')) {
		return `966${phone}`;
	}

	return phone;
}

evaluationForm.addEventListener('submit', (event) => {
	event.preventDefault();

	if (!evaluationForm.reportValidity()) {
		return;
	}

	const studentName = document.querySelector('#student-name').value.trim();
	const grade = document.querySelector('#grade').value.trim();
	const quran = document.querySelector('#quran').value;
	const noorAlBayan = document.querySelector('#noor-al-bayan').value;
	const learningNectar = document.querySelector('#learning-nectar').value;
	const activities = document.querySelector('#activities').value;
	const freePlay = document.querySelector('#free-play').value;
	const meal = document.querySelector('#meal').value;
	const teacherNotes = document.querySelector('#teacher-notes').value.trim();
	const phoneField = document.querySelector('#parent-phone');
	const phone = normalizeSaudiPhone(phoneField.value);

	if (!/^9665\d{8}$/.test(phone)) {
		phoneField.setCustomValidity('أدخلي رقم جوال سعودي صحيحًا يبدأ بـ 05 أو 5.');
		phoneField.reportValidity();
		phoneField.setCustomValidity('');
		return;
	}

	phoneField.value = phone;
	const notesBlock = teacherNotes ? `\n*ملاحظات المعلمة:*\n${teacherNotes}\n` : '';
	const message = ` *السلام عليكم ورحمة الله وبركاته*
 *هذا تقييم بطلنا/بطلتنا: ${studentName}*

 *الصف:* ${grade}
------------------------------
 *تقييم القرآن الكريم:* ${formatEvaluation(quran)}
 *تقييم نور البيان:* ${formatEvaluation(noorAlBayan)}
 *رحيق التعلم:* ${formatEvaluation(learningNectar)}
 *الأنشطة التعليمية:* ${formatEvaluation(activities)}
 *اللعب الحر:* ${formatParticipation(freePlay)}
 *الوجبة الغذائية:* ${formatMealStatus(meal)}
------------------------------${notesBlock}

*★ كل يوم نتعلم ونكبر دمتم أبطالنا في تميز ونجاح ★*`;
	const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
	window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});
