import express, { Request, Response } from "express";
import mysql from "mysql2/promise";
import cookieParser from 'cookie-parser';

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "mudar123",
  database: "unicesumar"
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//Categorias
app.get('/categories', async function (req: Request, res: Response) {
  const userCookie = req.cookies.user;
  if (userCookie) {
    const [rows] = await connection.query("SELECT id,name,DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS created_at FROM categories");
    return res.render('categories/index', {
      categories: rows
    });
  } else {
    res.redirect('/login');
  }
});

app.get("/categories/form", async function (req: Request, res: Response) {
  const userCookie = req.cookies.user;
  if (userCookie) {
    const user = JSON.parse(userCookie);
    res.render('categories/form', { user });
  } else {
    res.redirect('/login');
  }
});

app.post("/categories/save", async function (req: Request, res: Response) {
  const body = req.body;
  const insertQuery = "INSERT INTO categories (name) VALUES (?)";
  await connection.query(insertQuery, [body.name]);

  res.redirect("/categories");
});

app.post("/categories/delete/:id", async function (req: Request, res: Response) {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM categories WHERE id = ?";
  await connection.query(sqlDelete, [id]);

  res.redirect("/categories");
});

app.get("/categories/edit/:id", async function (req: Request, res: Response){
  const id = req.params.id;
  const [rows] = await connection.query("SELECT id,name FROM categories WHERE id = ?",[id]);
  const categorie = rows[0];
  if (categorie) {
    res.render('categories/editForm', { categorie });
  } else {
    res.status(404).send('Usuário não encontrado');
  }
})

app.post('/categories/edit/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const {name} = req.body;
  const [result] = await connection.query('UPDATE categories SET name = ? WHERE id = ?', [name,id]);
  if (result) {
    res.redirect('/categories');
  } else {
    res.status(404).send('Categoria não encontrado');
  }
});


//Usuarios
app.get("/users", async function (req: Request, res: Response) {
  const userCookie = req.cookies.user;
  if (userCookie) {
    const [rows] = await connection.query("SELECT id,name,email,papel,fl_ativo,DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS created_at FROM users");
    return res.render('users/index', {
      users: rows
    });
  } else {
    res.redirect('/login');
  }
});

app.get("/users/form", async function (req: Request, res: Response) {
  const userCookie = req.cookies.user;
  if (userCookie) {
    const user = JSON.parse(userCookie);
    res.render('users/form', { user });
  } else {
    res.redirect('/login');
  }

});

app.post("/users/add", async function (req: Request, res: Response) {
  const body = req.body;
  if (body.senha == body.confirmarSenha) {
    let fl_ativo
    if(body.ativo){
      fl_ativo = 1;
    }else{
      fl_ativo = 0;
    }
    const insertQuery = "INSERT INTO users (name,email,senha,papel,fl_ativo) VALUES (?,?,?,?,?)";
    await connection.query(insertQuery, [body.name, body.email, body.senha, body.papel, fl_ativo, body.created_at]);
    res.redirect("/users");
  }
  else {
    res.redirect("/users");
  }

});

app.post("/users/delete/:id", async function (req: Request, res: Response) {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM users WHERE id = ?";
  await connection.query(sqlDelete, [id]);
  res.redirect("/users");
});

//Renderiza a pagina de edit de usuario
app.get("/users/edit/:id", async function (req: Request, res: Response){
  const id = req.params.id;
  const [rows] = await connection.query("SELECT id,name,email,senha,papel,fl_ativo FROM users WHERE id = ?",[id]);
  const user = rows[0];
  if (user) {
    res.render('users/editForm', { user });
  } else {
    res.status(404).send('Usuário não encontrado');
  }
})

app.post('/users/edit/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, email,papel,senha,ativo } = req.body;
  let fl_ativo
    if(ativo){
      fl_ativo = 1;
    }else{
      fl_ativo = 0;
    }
  const [result] = await connection.query('UPDATE users SET name = ?, email = ?, senha = ?,papel = ?,fl_ativo = ? WHERE id = ?', [name, email,senha,papel,fl_ativo, id]);
  if (result) {
    res.redirect('/users');
  } else {
    res.status(404).send('Usuário não encontrado');
  }
});


//Blog Pagina inicial
app.get('/', async function (req: Request, res: Response) {
  try {
    const userCookie = req.cookies.user;
    if (userCookie) {
      const user = JSON.parse(userCookie);
      res.render('blog/index', { user });
    } else {
      res.redirect('/login');
    }
  } catch (e) { throw (e) }
});

//Login
//Pagina de login
app.get('/login', async function (req: Request, res: Response) {
  return res.render('login/index');
});

//Efetuar o login

app.post('/login/autenticar', async (req, res) => {
  const { email, senha } = req.body;
  const [rows]: any = await connection.query(
    'SELECT email,senha FROM users WHERE email = ? AND senha = ?', [email, senha]
  );
  if (rows.length > 0) {
    res.cookie('user', JSON.stringify(rows[0]), { httpOnly: true });
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

//logout
app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect('/login');
});


app.listen('3000', () => console.log("Server is listening on port 3000"));