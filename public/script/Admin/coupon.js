document.getElementById("addCouponForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const couponCode = document.getElementById("couponCode").value;
  const discountPrice = document.getElementById("discountPrice").value;
  const minimumPrice = document.getElementById("minimumPrice").value;
  const expirationDate = document.getElementById("expirationDate").value;

  try {
    const response = await axios.post("/admin/add-coupon", {
      couponCode,
      discountPrice,
      minimumPrice,
      expirationDate
    });

    if (response.data.success) {
      Swal.fire({
        icon: "success",
        title: "Coupon Added!",
        text: "The coupon has been successfully added.",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        document.getElementById("addCouponForm").reset(); 
        $("#addCouponModal").modal("hide");
        location.reload();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: response.data.message,
      });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Something went wrong! Please try again later.";
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: errorMessage,
    });
  }
});

// Delete Coupon
async function deleteCoupon(couponId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to undo this action!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`/admin/delete-coupon/${couponId}`);

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The coupon has been deleted successfully.",
            showConfirmButton: false,
            timer: 1500
          }).then(() => location.reload()); // Reload after deleting
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.data.message,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Failed to delete the coupon. Please try again.",
        });
      }
    }
  });
}
