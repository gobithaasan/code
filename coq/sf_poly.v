Require Export sf_lists.

Inductive boollist : Type :=
| bool_nil : boollist
| bool_cons : bool -> boollist -> boollist.

Inductive list' (X : Type) : Type :=
| nil' : list' X
| cons' : X -> list' X -> list' X.

Check nil.
Check cons.
Check (list nat).

Fixpoint length {X : Type} (L:list X) : nat :=
  match L with
    | nil => 0
    | cons x xs => 1 + (length xs)
  end.

Example test_length1 :
  length (cons 1 (cons 2 nil)) = 2.
Proof. reflexivity. Qed.

Example test_length2 :
  length (cons true (cons false (cons true nil))) = 3.
Proof. reflexivity. Qed.

Fixpoint app {T:Type} (a b : list T) : (list T) :=
  match a with
    | nil => b
    | cons x xs => cons x (app xs b)
  end.

Check @nil.
Check @length.
Check @app.
Check @test_length2.

Fixpoint snoc {X:Type} (l:list X) (v:X) : (list X) :=
  match l with
    | nil => cons v nil
    | cons x xs => cons x (snoc xs v)
  end.

Eval compute in (snoc (cons 1 (cons 2 nil)) 5).

Notation "x :: y" := 
  (cons x y) (at level 60, right associativity).
Notation "[ ]" := nil.
Notation "[ x ; .. ; y ]" := (cons x .. (cons y []) ..).
Notation "x ++ y" := 
  (app x y) (at level 60, right associativity).

Eval compute in ([1;2;3;4;5] ++ [6;7;8;9;10]).

Definition list123''' := [1; 2; 3].

Check ([3 + 4] ++ nil).

Fixpoint repeat {X : Type} (n : X) (count : nat) : list X :=
  match count with
    | 0 => []
    | S c => n :: (repeat n c)
  end.

Fixpoint rev {X : Type} (l : list X) : list X :=
  match l with
    | [] => []
    | x :: xs => snoc (rev xs) x
  end.

Example test_repeat1:
  repeat true 2 = cons true (cons true nil).
Proof. reflexivity. Qed.

Theorem nil_app : 
  forall X : Type, forall l : list X, app [] l = l.
Proof.
  intros X l.
  reflexivity.
Qed.

Theorem rev_snoc : 
  forall X : Type, forall v : X, forall s : list X,
    rev (snoc s v) = v :: (rev s).
Proof.
  intros X v s.
  induction s as [|x xs]. reflexivity.
  simpl. rewrite -> IHxs. reflexivity.
Qed.

Theorem rev_involutive : 
  forall X : Type, forall l : list X,
    rev (rev l) = l.
Proof.
  intros X l.
  induction l as [|x xs]. reflexivity.
  simpl. 
  rewrite -> rev_snoc. 
  rewrite -> IHxs.
  reflexivity.
Qed.

Theorem snoc_with_append : 
  forall X : Type, forall lst1 lst2 : list X, forall v : X,
    snoc (lst1 ++ lst2) v = lst1 ++ (snoc lst2 v).
Proof.
  intros X lst1 lst2 v.
  induction lst1 as [|x xs]. reflexivity.
  simpl. rewrite -> IHxs. reflexivity.
Qed.

Inductive prod (X Y : Type) : Type :=
  pair : X -> Y -> prod X Y.

Arguments pair {X} {Y} _ _.

Check @prod.

Notation "( x , y )" := (pair x y).

Notation "X × Y" := (prod X Y) : type_scope.

Definition fst {X Y : Type} (p : X × Y) : X :=
  match p with (x,y) => x end.

Definition snd {X Y : Type} (p : X × Y) : Y :=
  match p with (x,y) => y end.

Check (5, 3).

(* zip *)
Fixpoint combine {X Y : Type} (lx : list X) (ly : list Y) : list (X × Y) :=
  match (lx, ly) with
    | ([], _) => []
    | (_, []) => []
    | (x::xs, y::ys) => (x,y) :: (combine xs ys)
  end.

Eval compute in (combine [1;2] [false;false;true;true]).

Fixpoint split {X Y : Type} (lxy : list (X × Y)) : (list X) × (list Y) :=
  match lxy with
    | [] => ([], [])
    | (x, y) :: xys => 
      let (xs, ys) := split xys in
      (x :: xs, y :: ys)
  end.

Eval compute in (split [(1,false);(2,false)]).

Example test_split:
  split [(1,false);(2,false)] = ([1;2],[false;false]).
Proof. reflexivity. Qed.

Inductive option (X:Type) : Type :=
  | Some : X -> option X
  | None : option X.

Arguments Some {X} _.
Arguments None {X}.

Fixpoint index {X : Type} (n : nat) (l : list X) : option X :=
  match l with
    | [] => None
    | a :: l' => if beq_nat n O then Some a else index (pred n) l'
  end.

Example test_index1 : index 0 [4;5;6;7] = Some 4.
Proof. reflexivity. Qed.

Example test_index2 : index 1 [[1];[2]] = Some [2].
Proof. reflexivity. Qed.

Example test_index3 : index 2 [true] = None.
Proof. reflexivity. Qed.

Definition hd_opt {X : Type} (l : list X) : option X :=
  match l with
    | [] => None
    | x::xs => Some x
  end.

Check @hd_opt.

Example test_hd_opt1 : hd_opt [1;2] = Some 1.
Proof. reflexivity. Qed.

Example test_hd_opt2 : hd_opt [[1];[2]] = Some [1].
Proof. reflexivity. Qed.

Definition doit3times {X:Type} (f:X -> X) (x:X) : X :=
  (f (f (f x))).

Check @doit3times.

Example test_doit3times: doit3times minustwo 9 = 3.
Proof. reflexivity. Qed.

Example test_doit3times': doit3times negb true = false.
Proof. reflexivity. Qed.

Definition prod_curry {X Y Z : Type}
           (f : X × Y -> Z) (x : X) (y : Y) : Z := f (x, y).

Definition prod_uncurry {X Y Z : Type}
           (f : X -> Y -> Z) (p : X × Y) : Z := f (fst p) (snd p).

Check @prod_curry.
Check @prod_uncurry.

Theorem uncurry_curry : 
  forall (X Y Z : Type) (f : X -> Y -> Z) (x : X) (y : Y),
    prod_curry (prod_uncurry f) x y = f x y.
Proof.
  intros X Y Z f x y.
  compute. 
  reflexivity.
Qed.

Theorem curry_uncurry :
  forall (X Y Z : Type) (f : (X × Y) -> Z) (p : (X × Y)),
    prod_uncurry (prod_curry f) p = f p.
Proof.
  intros X Y Z f p.
  compute.
  destruct p.
  reflexivity.
Qed.

Fixpoint filter {X:Type} (test: X -> bool) (l:list X) : (list X) :=
  match l with
      | [] => []
      | x :: xs => 
        if test x
        then x :: filter test xs
        else filter test xs
  end.

Print filter.

Example test_filter1: filter evenb [1;2;3;4] = [2;4].
Proof. reflexivity. Qed.

Definition length_is_1 {X : Type} (l : list X) : bool :=
  beq_nat (length l) 1.

Example test_filter2:
  filter length_is_1 [[1;2];[3];[4];[5;6;7];[];[8]] = [[3];[4];[8]].
Proof. reflexivity. Qed.

Definition countoddmembers' (l:list nat) : nat :=
  length (filter oddb l).

Example test_countoddmembers'1: countoddmembers' [1;0;3;1;4;5] = 4.
Proof. reflexivity. Qed.
Example test_countoddmembers'2: countoddmembers' [0;2;4] = 0.
Proof. reflexivity. Qed.
Example test_countoddmembers'3: countoddmembers' nil = 0.
Proof. reflexivity. Qed.

Example test_anon_fun':
  doit3times (fun n => n × n) 2 = 256.
Proof. reflexivity. Qed.

Example test_filter2':
  filter (fun l => beq_nat (length l) 1) 
         [[1;2];[3];[4];[5;6;7];[];[8]] = [[3];[4];[8]].
Proof. reflexivity. Qed.



Definition filter_even_gt7 (l : list nat) : list nat :=
  filter (fun n => (andb (evenb n) (bgt_nat n 7))) l.

Eval compute in (filter_even_gt7 [1;2;6;9;10;3;12;8]).

Example test_filter_even_gt7_1 :
  filter_even_gt7 [1;2;6;9;10;3;12;8] = [10;12;8].
Proof. reflexivity. Qed.

Example test_filter_even_gt7_2 :
  filter_even_gt7 [5;2;6;19;129] = [].
Proof. reflexivity. Qed.

Fixpoint partition {X:Type} (p:X -> bool) (lst : list X) : (list (X × X)) :=
  