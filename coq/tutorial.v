Section Minimal_Logic.

  (* Variables A B C : Prop. *)

  Lemma distr_imp : 
    forall A B C : Prop, (A -> B -> C) -> (A -> B) -> A -> C.
  Proof.
    auto.
  Qed.

  Print distr_imp.

  Lemma conj_commutative : 
    forall A B : Prop, B /\ A -> A /\ B.
  Proof.
    intros   suppose_A_Prop suppose_B_Prop.
    intro    suppose_B_and_A.
    destruct suppose_B_and_A as [B_True A_True].
    split.
    apply    A_True.
    apply    B_True.
  Qed.

  Print conj_commutative.

  Lemma disj_commutative : 
    forall A B : Prop, A \/ B -> B \/ A.
  Proof.
    intros suppose_A_Prop suppose_B_Prop. (* Let A, B be propositions *)
    intro  suppose_A_or_B.                (* Assume A \/ B, need to show B \/ A *)
    elim   suppose_A_or_B.                (* Break into two subproofs: A -> B \/ A and B -> B \/ A *)
    intro  suppose_A_True.                (* Assume A to prove first part, need to show B \/ A *)
    clear  suppose_A_or_B.                (* Don't need this assumption anymore *)
    right.                                (* Disjunction derivation rule for A in B \/ A *)
    apply  suppose_A_True.                (* A -> A, so done with first part *)
    intro  suppose_B_True.                (* Assume B to show B \/ A *)
    left.                                 (* This time we need the left side *)
    apply  suppose_B_True.                (* Done with second part, proof complete *)
  Qed.

  Print disj_commutative.

  Lemma conj_distributive : 
    forall A B C : Prop, A -> (B /\ C) -> (A -> B) /\ (A -> C).
  Proof.
    intros A_Prop B_Prop C_Prop.
    intro A_True.
    intro B_and_C_True.
    destruct B_and_C_True as [B_True C_True].
    clear A_True.
    split.
    intro A_True.
    apply B_True.
    intro A_True.
    apply C_True.
  Qed.

  Print conj_distributive.

  Lemma Peirce_neg : 
    forall A B : Prop, ~ (((A -> B) -> A) -> A) -> False.
  Proof.
    tauto.
  Qed.

  Print Peirce_neg.

  Theorem contrapositive : 
    forall P Q : Prop, (P -> Q) -> (~ Q -> ~ P).
  Proof.
    intros suppose_P_Prop suppose_Q_Prop.
    intros suppose_P_im_Q.
    intros suppose_Q_False.
    intros suppose_P_True.
    apply suppose_P_im_Q in suppose_P_True.
    unfold not in suppose_Q_False.
    apply suppose_Q_False in suppose_P_True.
    exact suppose_P_True.
  Qed.
  
  Print contrapositive.

  Lemma neg_implication : 
    forall A B : Prop, ~ (~ (A -> B) -> A /\ ~ B) -> False.
  Proof.
    tauto.
  Qed.

  Print neg_implication.

  Lemma Peirce_neg_alt : 
    forall A B : Prop, ~ (((A -> B) -> A) -> A) -> False.
  Proof.
    tauto.
  Qed.

  Definition if_and_only_if (P Q : Prop) :=
    (P -> Q) /\ (Q -> P).

  Infix "iff" := if_and_only_if (at level 95, no associativity).

  Theorem bijection_equivalence :
    forall A B : Prop, (A -> B) /\ (B -> A) -> (A iff B).
  Proof.
    intros A B.
    unfold if_and_only_if.
    intro AtoB_and_BtoA.
    exact AtoB_and_BtoA.
  Qed.

End Minimal_Logic.

Section Predicate_calculus.

  Variable D : Set.
  Variable R : D -> D -> Prop.

  Section R_sym_trans.
    Hypothesis R_symmetric : forall x y : D, R x y -> R y x.
    Hypothesis R_transitive : forall x y z : D, R x y /\ R y z -> R x z.
    Lemma refl_if : forall x : D, (exists y, R x y) -> R x x.
    Proof.
      intros x x_Rlinked.
      elim x_Rlinked.
      intro y.
      intro Rxy.
      apply R_symmetric in Rxy.
      apply R_transitive with y.
      split.
      apply R_symmetric.
      exact Rxy.
      exact Rxy.
    Qed.

    Print refl_if.
  End R_sym_trans.

  Section Predicate_paradox.
    Variable P : D -> Prop.
    Variable d : D.
    Lemma paradox : (forall x : D, P x) -> exists a, P a.
    Proof.
      intro Hx.
      exists d.
      apply Hx.
    Qed.
    Print paradox.

    Hypothesis LEM : forall A : Prop, A \/ ~ A.
    Lemma smullyan : exists x : D, P x -> forall x : D, P x.
      elim (LEM (exists x : D, ~ P x)).
      
  End Predicate_paradox.