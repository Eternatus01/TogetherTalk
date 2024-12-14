import Swal from 'sweetalert2';

export const showSuccessAlert = () => {
  Swal.fire({
    title: 'Успех!',
    text: 'Сообщение отправлено',
    icon: 'success',
    timer: 3000,
    showConfirmButton: false
  });
}

export const showErrorAlert = () => {
  Swal.fire({
    title: 'Ошибка!',
    text: 'Ошибка на сервере',
    icon: 'error',
    timer: 3000,
    showConfirmButton: false
  });
}