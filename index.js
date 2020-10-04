'use strict';

const buttons = document.querySelectorAll('button');
const form = document.querySelector('form');
const formAct = document.querySelector('form span');
const input = document.querySelector('input');
const errors = document.querySelector('.error');

let activity = 'cycling';

buttons.forEach(button => {
    button.addEventListener('click', e => {
        activity = e.target.dataset.activity;
        buttons.forEach(button => { return button.classList.remove('active'); });
        e.target.classList.add('active');

        input.setAttribute('id', activity);

        formAct.textContent = activity;

        update(data);
    });
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const distance = parseInt(input.value);

    if (distance) {
        db.collection('activities').add({
            distance: distance,
            activity: activity,
            date: new Date().toString()
        }).then(() => {
            errors.textContent = '';
            input.value = '';
        });
    } else {
        errors.textContent = 'Please enter a valid distance';
    }
});
