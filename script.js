const PLACEHOLDER_IMG =
"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='100%' height='100%' fill='%23173b27'/><text x='50%' y='45%' text-anchor='middle' fill='%23f4c400' font-size='42'>PHÒNG HỒ CHÍ MINH</text><text x='50%' y='60%' text-anchor='middle' fill='%23fff' font-size='20'>Chưa có ảnh</text></svg>";

/* =====================================================
   DỮ LIỆU ẢNH
===================================================== */

const DEFAULT_DATA = [
    {
        title: "1. Khuôn viên Phòng Hồ Chí Minh",
        text: "Phòng Hồ Chí Minh là trung tâm tham mưu, tổ chức thực hiện công tác Đảng, công tác chính trị; không gian được xây dựng khang trang, chính quy, sáng - xanh - sạch - đẹp, tạo môi trường sinh hoạt và làm việc hiệu quả.",
        info: [
            "Không gian sinh hoạt chính trị",
            "Khang trang, chính quy",
            "Sáng - xanh - sạch - đẹp"
        ]
    },
    {
        title: "2. Truyền thống Hồ Chí Minh",
        text: "Khu vực trưng bày hình ảnh, tư liệu và truyền thống của đơn vị, phục vụ giáo dục truyền thống, bồi dưỡng niềm tự hào và trách nhiệm cho cán bộ, chiến sĩ.",
        info: [
            "Không gian sinh hoạt chính trị",
            "Khang trang, chính quy",
            "Sáng - xanh - sạch - đẹp"
        ]
    },
    {
        title: "3. Học tập chính trị",
        text: "Phục vụ học tập, sinh hoạt chính trị, tuyên truyền và phổ biến các nội dung CTĐ, CTCT trong đơn vị.",
        info: [
            "Không gian sinh hoạt chính trị",
            "Khang trang, chính quy",
            "Sáng - xanh - sạch - đẹp"
        ]
    },
    {
        title: "4. Thư viện, tài liệu",
        text: "Không gian lưu trữ và khai thác sách, báo, tài liệu phục vụ học tập, nghiên cứu và nâng cao đời sống tinh thần.",
        info: [
            "Không gian sinh hoạt chính trị",
            "Khang trang, chính quy",
            "Sáng - xanh - sạch - đẹp"
        ]
    }
];

let DATA = [...DEFAULT_DATA];

let selected = 0;


/* =====================================================
   ĐỌC DỮ LIỆU ẢNH ĐÃ LƯU
===================================================== */

try {
    const savedPhotos = JSON.parse(
        localStorage.getItem("phong_hcm_photos") || "[]"
    );

    if (Array.isArray(savedPhotos)) {
        savedPhotos.forEach(saved => {
            const i = DATA.findIndex(
                x => x.title === saved.title
            );

            if (i >= 0) {
                DATA[i] = {
                    ...DATA[i],
                    ...saved
                };
            } else {
                DATA.push(saved);
            }
        });
    }
} catch (e) {
    console.warn("Không thể đọc dữ liệu ảnh:", e);
}


/* =====================================================
   VẬT TƯ
===================================================== */

let items = [];

try {
    items = JSON.parse(
        localStorage.getItem("phong_hcm_items") || "[]"
    );

    if (!Array.isArray(items)) {
        items = [];
    }
} catch (e) {
    items = [];
}


/* =====================================================
   SÁCH
===================================================== */

let books = [];

try {
    books = JSON.parse(
        localStorage.getItem("phong_hcm_books") || "[]"
    );

    if (!Array.isArray(books)) {
        books = [];
    }
} catch (e) {
    books = [];
}

let editingBookId = null;
let pendingBookImage = "";


/* =====================================================
   MƯỢN TRẢ SÁCH
===================================================== */

let borrowings = [];

try {
    borrowings = JSON.parse(
        localStorage.getItem("phong_hcm_borrowings") || "[]"
    );

    if (!Array.isArray(borrowings)) {
        borrowings = [];
    }
} catch (e) {
    borrowings = [];
}


function saveBorrowings() {
    localStorage.setItem(
        "phong_hcm_borrowings",
        JSON.stringify(borrowings)
    );
}


function getBorrowedQuantity(bookId) {
    return borrowings.filter(
        x =>
            x.bookId === bookId &&
            x.status === "ĐANG MƯỢN"
    ).length;
}


function getAvailableQuantity(book) {
    const borrowed =
        getBorrowedQuantity(book.id);

    return Math.max(
        0,
        Number(book.quantity || 0) - borrowed
    );
}


/* =====================================================
   HIỂN THỊ GALLERY
===================================================== */

function renderGallery() {

    const gallery =
        document.getElementById("gallery");

    if (!gallery) return;

    gallery.innerHTML = DATA.map((x, i) => {

        const hasImg = !!x.src;

        const imgSrc =
            hasImg
                ? x.src
                : PLACEHOLDER_IMG;

        return `
            <div
                class="photo-card"
                onclick="selectImage(${i})">

                <div
                    class="photo-wrap ${hasImg ? "" : "no-image"}">

                    <img
                        src="${imgSrc}"
                        alt="${escapeHTML(x.title)}">

                    <button
                        class="replace-btn"
                        onclick="event.stopPropagation(); replacePhoto(${i})">
                        📷 Đổi ảnh
                    </button>

                    <button
                        class="info-btn"
                        onclick="event.stopPropagation(); selectImage(${i})">
                        i
                    </button>

                </div>

                <div class="photo-name">
                    ${escapeHTML(x.title)}
                </div>

            </div>
        `;

    }).join("");

    const s1 =
        document.getElementById("s1");

    if (s1) {
        s1.textContent =
            DATA.filter(x => x.src).length +
            "/" +
            DATA.length;
    }
}


/* =====================================================
   CHỌN ẢNH
===================================================== */

function selectImage(i) {

    if (!DATA[i]) return;

    selected = i;

    const x = DATA[i];

    const detailTitle =
        document.getElementById("detailTitle");

    const detailImg =
        document.getElementById("detailImg");

    const detailText =
        document.getElementById("detailText");

    const detailList =
        document.getElementById("detailList");

    const dots =
        document.getElementById("dots");


    if (detailTitle) {
        detailTitle.textContent =
            x.title.toUpperCase();
    }


    if (detailImg) {
        detailImg.src =
            x.src || PLACEHOLDER_IMG;
    }


    if (detailText) {
        detailText.textContent =
            x.text || "";
    }


    if (detailList) {
        detailList.innerHTML =
            (x.info || [])
                .map(
                    v =>
                        `<li>${escapeHTML(v)}</li>`
                )
                .join("");
    }


    if (dots) {
        dots.innerHTML =
            DATA.map(
                (_, j) =>
                    `<button
                        class="dot ${j === i ? "active" : ""}"
                        onclick="selectImage(${j})">
                    </button>`
            ).join("");
    }
}


/* =====================================================
   LƯU ẢNH
===================================================== */

function saveCustomPhotos() {

    try {

        localStorage.setItem(
            "phong_hcm_photos",
            JSON.stringify(
                DATA.filter(x => x.src)
            )
        );

        return true;

    } catch (e) {

        alert(
            "Bộ nhớ trình duyệt không đủ để lưu ảnh."
        );

        return false;
    }
}


/* =====================================================
   NÉN ẢNH
===================================================== */

function resizePhoto(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                const image =
                    new Image();

                image.onload = () => {

                    const maxW = 1400;
                    const maxH = 1000;

                    const scale =
                        Math.min(
                            1,
                            maxW / image.width,
                            maxH / image.height
                        );

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        Math.max(
                            1,
                            Math.round(
                                image.width * scale
                            )
                        );

                    canvas.height =
                        Math.max(
                            1,
                            Math.round(
                                image.height * scale
                            )
                        );

                    const ctx =
                        canvas.getContext("2d");

                    ctx.drawImage(
                        image,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    resolve(
                        canvas.toDataURL(
                            "image/jpeg",
                            0.84
                        )
                    );
                };

                image.onerror = reject;

                image.src =
                    reader.result;
            };

            reader.onerror = reject;

            reader.readAsDataURL(file);
        }
    );
}


/* =====================================================
   ĐỔI ẢNH
===================================================== */

async function replacePhoto(index) {

    if (!DATA[index]) return;

    const input =
        document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {

        const file =
            input.files[0];

        if (!file) return;

        try {

            DATA[index].src =
                await resizePhoto(file);

            const title =
                prompt(
                    "Tên ảnh:",
                    DATA[index].title
                );

            if (title) {
                DATA[index].title =
                    title.trim();
            }

            const text =
                prompt(
                    "Nội dung giới thiệu:",
                    DATA[index].text
                );

            if (text !== null) {
                DATA[index].text =
                    text.trim();
            }

            DATA[index].custom = true;

            saveCustomPhotos();

            renderGallery();

            selectImage(index);

            alert("Đã cập nhật ảnh.");

        } catch (e) {

            console.error(e);

            alert(
                "Không thể đọc ảnh này."
            );
        }
    };

    input.click();
}


/* =====================================================
   XÓA ẢNH
===================================================== */

function deletePhoto(index) {

    const x = DATA[index];

    if (!x) return;

    const ok =
        confirm(
            'Bạn có chắc muốn xóa ảnh "' +
            x.title +
            '" không?'
        );

    if (!ok) return;

    if (index < DEFAULT_DATA.length) {

        delete DATA[index].src;
        delete DATA[index].custom;

    } else {

        DATA.splice(index, 1);
    }

    saveCustomPhotos();

    renderGallery();

    if (DATA.length > 0) {

        selectImage(
            Math.min(
                index,
                DATA.length - 1
            )
        );
    }
}


/* =====================================================
   SÁCH
===================================================== */

function saveBooks() {

    localStorage.setItem(
        "phong_hcm_books",
        JSON.stringify(books)
    );
}


/* =====================================================
   CHỐNG HTML
===================================================== */

function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   HIỂN THỊ SÁCH
===================================================== */

function renderBooks() {

    const grid =
        document.getElementById("bookGrid");

    if (!grid) return;

    const search =
        document.getElementById("bookSearch");

    const keyword =
        search
            ? search.value.trim().toLowerCase()
            : "";

    const filtered =
        books.filter(book => {

            const name =
                String(
                    book.name || ""
                ).toLowerCase();

            const author =
                String(
                    book.author || ""
                ).toLowerCase();

            const category =
                String(
                    book.category || ""
                ).toLowerCase();

            return (
                name.includes(keyword) ||
                author.includes(keyword) ||
                category.includes(keyword)
            );
        });


    if (!filtered.length) {

        grid.innerHTML = `
            <div class="empty-books">
                <div style="font-size:48px">
                    📚
                </div>

                <h3>Chưa có sách</h3>

                <p>
                    Bấm <b>+ THÊM SÁCH</b>
                    để thêm sách vào thư viện.
                </p>
            </div>
        `;

        const s5 =
            document.getElementById("s5");

        if (s5) {
            s5.textContent =
                books.length;
        }

        return;
    }


    grid.innerHTML =
        filtered.map(book => {

            const available =
                getAvailableQuantity(book);

            const cover =
                book.image
                    ? `
                        <img
                            src="${book.image}"
                            alt="${escapeHTML(book.name)}">
                      `
                    : `
                        <div class="book-no-image">
                            <strong>📚</strong>
                            Chưa có ảnh bìa
                        </div>
                      `;


            return `
                <div class="book-card">

                    <div class="book-cover">
                        ${cover}
                    </div>

                    <div class="book-info">

                        <div class="book-title">
                            ${escapeHTML(book.name)}
                        </div>

                        <div class="book-author">
                            ✍️
                            ${escapeHTML(
                                book.author ||
                                "Chưa cập nhật tác giả"
                            )}
                        </div>

                        <span class="book-category">
                            ${escapeHTML(
                                book.category || ""
                            )}
                        </span>

                        <div
                            style="
                                font-size:12px;
                                margin-top:5px
                            ">
                            📦 Tổng số:
                            <b>
                                ${Number(
                                    book.quantity || 0
                                )}
                            </b>
                        </div>

                        <div
                            style="
                                font-size:12px;
                                margin-top:4px
                            ">
                            📗 Còn lại:
                            <b>
                                ${available}
                            </b>
                        </div>

                        <div style="margin-top:8px">

                            ${
                                available > 0

                                ? `
                                    <span
                                        style="
                                            display:inline-block;
                                            padding:5px 9px;
                                            border-radius:20px;
                                            font-size:11px;
                                            font-weight:800;
                                        ">
                                        🟢 CÓ SẴN
                                    </span>
                                  `

                                : `
                                    <span
                                        style="
                                            display:inline-block;
                                            padding:5px 9px;
                                            border-radius:20px;
                                            font-size:11px;
                                            font-weight:800;
                                        ">
                                        🔴 ĐANG MƯỢN
                                    </span>
                                  `
                            }

                        </div>

                        <div class="book-actions">

                            <button
                                class="view-book"
                                onclick="viewBook('${book.id}')">
                                👁 Xem
                            </button>

                            <button
                                class="view-book"
                                onclick="borrowBook('${book.id}')"
                                ${available <= 0 ? "disabled" : ""}>
                                📖 Mượn
                            </button>

                            <button
                                class="edit-book"
                                onclick="editBook('${book.id}')">
                                ✏️ Sửa
                            </button>

                            <button
                                class="delete-book"
                                onclick="deleteBook('${book.id}')">
                                🗑 Xóa
                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("");


    const s5 =
        document.getElementById("s5");

    if (s5) {
        s5.textContent =
            books.length;
    }
}


/* =====================================================
   MƯỢN SÁCH
===================================================== */

function borrowBook(id) {

    const book =
        books.find(x => x.id === id);

    if (!book) return;

    const available =
        getAvailableQuantity(book);

    if (available <= 0) {

        alert(
            "Sách này hiện đã hết trong thư viện."
        );

        return;
    }

    const borrower =
        prompt(
            "Nhập HỌ VÀ TÊN người mượn:"
        );

    if (!borrower) return;

    const unit =
        prompt(
            "Nhập ĐƠN VỊ / TRUNG ĐỘI:",
            ""
        );

    if (unit === null) return;

    const today =
        new Date();

    const defaultDate =
        String(today.getDate())
            .padStart(2, "0") +
        "/" +
        String(
            today.getMonth() + 1
        ).padStart(2, "0") +
        "/" +
        today.getFullYear();

    const returnDate =
        prompt(
            "Nhập HẠN TRẢ:",
            defaultDate
        );

    if (returnDate === null) return;

    borrowings.push({

        id:
            "BORROW-" +
            Date.now(),

        bookId:
            book.id,

        borrower:
            borrower.trim(),

        unit:
            unit.trim(),

        borrowDate:
            defaultDate,

        returnDate:
            returnDate.trim(),

        status:
            "ĐANG MƯỢN"
    });

    saveBorrowings();

    renderBooks();

    alert(
        "📖 Đã ghi nhận cho mượn sách!"
    );
}


/* =====================================================
   FORM SÁCH
===================================================== */

function openBookForm(id = null) {

    editingBookId = id;

    pendingBookImage = "";

    const form =
        document.getElementById("bookForm");

    if (form) {
        form.reset();
    }

    const quantity =
        document.getElementById(
            "bookQuantity"
        );

    if (quantity) {
        quantity.value = 1;
    }

    const bookId =
        document.getElementById(
            "bookId"
        );

    if (bookId) {
        bookId.value = "";
    }

    const preview =
        document.getElementById(
            "bookPreview"
        );

    if (preview) {
        preview.innerHTML =
            "<div>📚<br>Chưa chọn ảnh</div>";
    }

    const title =
        document.getElementById(
            "bookFormTitle"
        );

    if (title) {
        title.textContent =
            id
                ? "SỬA THÔNG TIN SÁCH"
                : "THÊM SÁCH";
    }

    if (id) {

        const book =
            books.find(x => x.id === id);

        if (!book) return;

        document.getElementById("bookId").value =
            book.id;

        document.getElementById("bookName").value =
            book.name || "";

        document.getElementById("bookAuthor").value =
            book.author || "";

        document.getElementById("bookCategory").value =
            book.category || "Khác";

        document.getElementById("bookQuantity").value =
            book.quantity || 0;

        document.getElementById("bookContent").value =
            book.content || "";

        pendingBookImage =
            book.image || "";

        if (preview) {

            if (book.image) {

                preview.innerHTML = `
                    <img
                        src="${book.image}"
                        alt="Ảnh bìa">
                `;

            } else {

                preview.innerHTML =
                    "<div>📚<br>Chưa có ảnh</div>";
            }
        }
    }

    const modal =
        document.getElementById(
            "bookFormModal"
        );

    if (modal) {
        modal.classList.add("show");
    }
}


/* =====================================================
   ĐÓNG FORM SÁCH
===================================================== */

function closeBookForm() {

    const modal =
        document.getElementById(
            "bookFormModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

    editingBookId = null;
    pendingBookImage = "";
}


/* =====================================================
   XEM CHI TIẾT SÁCH
===================================================== */

function viewBook(id) {

    const book =
        books.find(x => x.id === id);

    if (!book) return;

    const name =
        document.getElementById(
            "detailBookName"
        );

    const meta =
        document.getElementById(
            "detailBookMeta"
        );

    const content =
        document.getElementById(
            "detailBookContent"
        );

    const cover =
        document.getElementById(
            "detailBookCover"
        );


    if (name) {
        name.textContent =
            book.name || "";
    }


    if (meta) {
        meta.innerHTML = `
            <div><b>Tác giả:</b> ${escapeHTML(book.author || "Chưa cập nhật")}</div>
            <div><b>Thể loại:</b> ${escapeHTML(book.category || "Khác")}</div>
            <div><b>Số lượng:</b> ${Number(book.quantity || 0)}</div>
            <div><b>Còn lại:</b> ${getAvailableQuantity(book)}</div>
        `;
    }


    if (content) {
        content.textContent =
            book.content ||
            "Chưa có nội dung giới thiệu.";
    }


    if (cover) {

        if (book.image) {

            cover.innerHTML = `
                <img
                    src="${book.image}"
                    alt="${escapeHTML(book.name)}">
            `;

        } else {

            cover.innerHTML =
                "<div>📚<br>Chưa có ảnh bìa</div>";
        }
    }


    const modal =
        document.getElementById(
            "bookDetailModal"
        );

    if (modal) {
        modal.classList.add("show");
    }
}


/* =====================================================
   ĐÓNG CHI TIẾT SÁCH
===================================================== */

function closeBookDetail() {

    const modal =
        document.getElementById(
            "bookDetailModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }
}


/* =====================================================
   SỬA SÁCH
===================================================== */

function editBook(id) {
    openBookForm(id);
}


/* =====================================================
   XÓA SÁCH
===================================================== */

function deleteBook(id) {

    const book =
        books.find(x => x.id === id);

    if (!book) return;

    const ok =
        confirm(
            'Bạn có chắc muốn xóa sách "' +
            book.name +
            '" không?'
        );

    if (!ok) return;

    books =
        books.filter(
            x => x.id !== id
        );

    borrowings =
        borrowings.filter(
            x => x.bookId !== id
        );

    saveBooks();
    saveBorrowings();

    renderBooks();
}


/* =====================================================
   XEM TRƯỚC ẢNH BÌA
===================================================== */

function previewBookImage(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = function(e) {

        pendingBookImage =
            e.target.result;

        const preview =
            document.getElementById(
                "bookPreview"
            );

        if (preview) {

            preview.innerHTML = `
                <img
                    src="${e.target.result}"
                    alt="Ảnh bìa sách">
            `;
        }
    };

    reader.readAsDataURL(file);
}


/* =====================================================
   LƯU SÁCH
===================================================== */

function saveBook(event) {

    event.preventDefault();

    const name =
        document.getElementById(
            "bookName"
        ).value.trim();

    const author =
        document.getElementById(
            "bookAuthor"
        ).value.trim();

    const category =
        document.getElementById(
            "bookCategory"
        ).value;

    const quantity =
        Number(
            document.getElementById(
                "bookQuantity"
            ).value || 0
        );

    const content =
        document.getElementById(
            "bookContent"
        ).value.trim();


    if (!name) {

        alert(
            "Vui lòng nhập tên sách."
        );

        return;
    }


    if (editingBookId) {

        const book =
            books.find(
                x => x.id === editingBookId
            );

        if (!book) return;

        book.name =
            name;

        book.author =
            author;

        book.category =
            category;

        book.quantity =
            Math.max(0, quantity);

        book.content =
            content;

        if (pendingBookImage) {
            book.image =
                pendingBookImage;
        }

    } else {

        books.push({

            id:
                "BOOK-" +
                Date.now(),

            name:
                name,

            author:
                author,

            category:
                category,

            quantity:
                Math.max(0, quantity),

            image:
                pendingBookImage || "",

            content:
                content
        });
    }


    saveBooks();

    renderBooks();

    closeBookForm();

    alert(
        editingBookId
            ? "Đã cập nhật sách."
            : "Đã thêm sách."
    );
}


/* =====================================================
   ĐIỀU HƯỚNG TRANG
===================================================== */

function page(id, button) {

    document
        .querySelectorAll(".page")
        .forEach(p => {
            p.classList.remove("active");
        });

    const target =
        document.getElementById(id);

    if (target) {
        target.classList.add("active");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }


    if (id === "intro") {
        renderGallery();
        selectImage(
            Math.min(
                selected,
                DATA.length - 1
            )
        );
    }


    if (id === "books") {
        renderBooks();
    }


    if (id === "inventory") {
        renderItems();
    }


    updateStats();
}


/* =====================================================
   VẬT TƯ
===================================================== */

function saveItems() {

    localStorage.setItem(
        "phong_hcm_items",
        JSON.stringify(items)
    );
}


function renderItems() {

    const tbody =
        document.getElementById(
            "items"
        );

    if (!tbody) return;

    if (!items.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:25px;
                        color:#68756e;
                    ">
                    Chưa có vật tư.
                </td>
            </tr>
        `;

        updateStats();

        return;
    }


    tbody.innerHTML =
        items.map((item, index) => {

            return `
                <tr>

                    <td>
                        ${escapeHTML(
                            item.code || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.name || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.unit || ""
                        )}
                    </td>

                    <td>
                        ${Number(
                            item.quantity || 0
                        )}
                    </td>

                    <td>
                        <span class="status-${String(item.status || "").replace(/\s/g, "-")}">
                            ${escapeHTML(
                                item.status || ""
                            )}
                        </span>
                    </td>

                    <td>

                        <button
                            class="edit-book"
                            onclick="editItem(${index})">
                            ✏️ Sửa
                        </button>

                        <button
                            class="delete-book"
                            onclick="deleteItem(${index})">
                            🗑 Xóa
                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    updateStats();
}


/* =====================================================
   THÊM VẬT TƯ
===================================================== */

function addItem() {

    const code =
        prompt(
            "Nhập mã vật tư:"
        );

    if (code === null) return;

    const name =
        prompt(
            "Nhập tên vật tư:"
        );

    if (name === null) return;

    const unit =
        prompt(
            "Nhập đơn vị tính:",
            "Cái"
        );

    if (unit === null) return;

    const quantity =
        prompt(
            "Nhập số lượng:",
            "1"
        );

    if (quantity === null) return;

    const status =
        prompt(
            "Nhập tình trạng:\nTốt\nCần sửa chữa\nHỏng",
            "Tốt"
        );

    if (status === null) return;


    items.push({

        code:
            code.trim(),

        name:
            name.trim(),

        unit:
            unit.trim(),

        quantity:
            Math.max(
                0,
                Number(quantity) || 0
            ),

        status:
            status.trim()
    });


    saveItems();

    renderItems();

    alert(
        "Đã thêm vật tư."
    );
}


/* =====================================================
   SỬA VẬT TƯ
===================================================== */

function editItem(index) {

    const item =
        items[index];

    if (!item) return;


    const code =
        prompt(
            "Mã vật tư:",
            item.code || ""
        );

    if (code === null) return;


    const name =
        prompt(
            "Tên vật tư:",
            item.name || ""
        );

    if (name === null) return;


    const unit =
        prompt(
            "Đơn vị tính:",
            item.unit || ""
        );

    if (unit === null) return;


    const quantity =
        prompt(
            "Số lượng:",
            item.quantity || 0
        );

    if (quantity === null) return;


    const status =
        prompt(
            "Tình trạng:\nTốt\nCần sửa chữa\nHỏng",
            item.status || "Tốt"
        );

    if (status === null) return;


    item.code =
        code.trim();

    item.name =
        name.trim();

    item.unit =
        unit.trim();

    item.quantity =
        Math.max(
            0,
            Number(quantity) || 0
        );

    item.status =
        status.trim();


    saveItems();

    renderItems();
}


/* =====================================================
   XÓA VẬT TƯ
===================================================== */

function deleteItem(index) {

    const item =
        items[index];

    if (!item) return;

    const ok =
        confirm(
            'Bạn có chắc muốn xóa vật tư "' +
            item.name +
            '" không?'
        );

    if (!ok) return;

    items.splice(
        index,
        1
    );

    saveItems();

    renderItems();
}


/* =====================================================
   THỐNG KÊ
===================================================== */

function updateStats() {

    const s1 =
        document.getElementById("s1");

    const s2 =
        document.getElementById("s2");

    const s3 =
        document.getElementById("s3");

    const s4 =
        document.getElementById("s4");

    const s5 =
        document.getElementById("s5");


    if (s1) {
        s1.textContent =
            DATA.filter(x => x.src).length +
            "/" +
            DATA.length;
    }


    if (s2) {
        s2.textContent =
            items.length;
    }


    if (s3) {
        s3.textContent =
            items.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.quantity || 0
                    ),
                0
            );
    }


    if (s4) {
        s4.textContent =
            items.filter(
                item =>
                    item.status === "Hỏng" ||
                    item.status === "Cần sửa chữa" ||
                    Number(item.quantity || 0) <= 0
            ).length;
    }


    if (s5) {
        s5.textContent =
            books.length;
    }
}


/* =====================================================
   MÀN HÌNH CHỜ
===================================================== */

function updateClock() {

    const now =
        new Date();


    const time =
        document.getElementById(
            "time"
        );

    const date =
        document.getElementById(
            "date"
        );

    const welcomeTime =
        document.getElementById(
            "welcomeTime"
        );

    const welcomeDate =
        document.getElementById(
            "welcomeDate"
        );


    const h =
        String(
            now.getHours()
        ).padStart(2, "0");

    const m =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const s =
        String(
            now.getSeconds()
        ).padStart(2, "0");


    const timeText =
        `${h}:${m}:${s}`;


    const days = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy"
    ];


    const d =
        String(
            now.getDate()
        ).padStart(2, "0");

    const mo =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const y =
        now.getFullYear();


    const dateText =
        `${d}/${mo}/${y}`;

    const fullDateText =
        `${days[now.getDay()]}, ${dateText}`;


    if (time) {
        time.textContent =
            timeText;
    }


    if (date) {
        date.textContent =
            fullDateText;
    }


    if (welcomeTime) {
        welcomeTime.textContent =
            timeText;
    }


    if (welcomeDate) {
        welcomeDate.textContent =
            dateText;
    }
}


/* =====================================================
   VÀO HỆ THỐNG
===================================================== */

function enterSystem() {

    const welcome =
        document.getElementById(
            "welcomeScreen"
        );

    if (!welcome) return;

    welcome.classList.add(
        "hide"
    );


    setTimeout(() => {

        welcome.style.display =
            "none";

    }, 700);
}


/* =====================================================
   PHÓNG TO ẢNH
===================================================== */

let currentZoom = 1;


function openImageModal(src) {

    const modal =
        document.getElementById(
            "imageModal"
        );

    const img =
        document.getElementById(
            "zoomImg"
        );

    if (!modal || !img) return;

    img.src = src;

    currentZoom = 1;

    img.style.transform =
        "scale(1)";

    modal.classList.add(
        "show"
    );
}


function closeImageModal() {

    const modal =
        document.getElementById(
            "imageModal"
        );

    if (modal) {
        modal.classList.remove(
            "show"
        );
    }
}


function zoomIn(event) {

    if (event) {
        event.stopPropagation();
    }

    currentZoom =
        Math.min(
            4,
            currentZoom + 0.25
        );

    applyZoom();
}


function zoomOut(event) {

    if (event) {
        event.stopPropagation();
    }

    currentZoom =
        Math.max(
            0.5,
            currentZoom - 0.25
        );

    applyZoom();
}


function resetZoom(event) {

    if (event) {
        event.stopPropagation();
    }

    currentZoom = 1;

    applyZoom();
}


function applyZoom() {

    const img =
        document.getElementById(
            "zoomImg"
        );

    if (!img) return;

    img.style.transform =
        `scale(${currentZoom})`;
}


/* =====================================================
   CLICK ẢNH CHI TIẾT
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const target =
            event.target;

        if (
            target &&
            target.id === "detailImg" &&
            target.src
        ) {

            openImageModal(
                target.src
            );
        }
    }
);


/* =====================================================
   PHÍM ESC
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeImageModal();

            closeBookForm();

            closeBookDetail();
        }
    }
);


/* =====================================================
   CLICK NGOÀI MODAL
===================================================== */

document.addEventListener(
    "click",
    function(event) {

        const bookFormModal =
            document.getElementById(
                "bookFormModal"
            );

        const bookDetailModal =
            document.getElementById(
                "bookDetailModal"
            );


        if (
            bookFormModal &&
            event.target === bookFormModal
        ) {
            closeBookForm();
        }


        if (
            bookDetailModal &&
            event.target === bookDetailModal
        ) {
            closeBookDetail();
        }
    }
);


/* =====================================================
   KHỞI ĐỘNG
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderGallery();

        if (DATA.length > 0) {
            selectImage(0);
        }

        renderBooks();

        renderItems();

        updateStats();

        updateClock();

        setInterval(
            updateClock,
            1000
        );
    }
);